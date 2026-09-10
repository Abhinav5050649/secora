import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "../libs";
import { UserService, OrganizationUserService, toPublicUser } from "../services";
import { ROLE_RANK } from "../middleware";
import type { OrganizationUserRole } from "../models";

/**
 * HTTP layer for organization-membership endpoints
 * (`/organizations/:organization_id/users`). Translates Hono `Context`
 * objects into `UserService`/`OrganizationUserService` calls and maps the
 * results to HTTP responses/errors. A "member" response combines the
 * user's profile fields with the role from their `organization_user`
 * membership row; `id` on that response is the *membership's* id, while
 * `user_id` is the underlying user's own id.
 *
 * `requireRole('admin')` (in `OrganizationUserRoute`) only checks that the
 * caller holds *some* sufficiently-ranked role in the organization - it
 * can't express finer rules like "not on your own membership", so
 * `update`/`delete`/`post` below layer those on top using `ROLE_RANK`. The
 * two endpoints intentionally use different rules:
 *   - `update` (role changes): nobody can change their own role, including
 *     an `owner` (self-demotion is never allowed). Otherwise any `admin`+
 *     may change any other non-owner member's role freely - two `admin`s
 *     can change each other's roles - but only an `owner` may change
 *     another `owner`'s role. A caller can also never assign a role ranked
 *     above their own, so an `admin` can't mint a new `owner`.
 *   - `delete` (removal): a caller may only remove a membership ranked
 *     strictly below their own, which is what makes "only an `owner` can
 *     remove an `admin`" and "an `admin` can't remove another `admin` or
 *     the `owner`" fall out for free, and also blocks self-removal.
 */
export class OrganizationUserController {
    constructor(private userService: UserService, private organizationUserService: OrganizationUserService) {
    }

    /**
     * GET /organizations/:organization_id/users
     * Lists the members of an organization, each combined with their role.
     *
     * @param c - Hono request context; expects an `organization_id` route
     * param. Accepts optional `limit` (max rows to return) and `offset`
     * (rows to skip before returning results) query params.
     * @returns JSON array of members.
     * @throws {HTTPException} 400 if the `organization_id` param is missing.
     */
    getAll = async (c: Context) => {
        logger.info(`Start method: ${this.constructor.name}.${this.getAll.name}`);

        const organizationId = c.req.param('organization_id');

        if (!organizationId) {
            throw new HTTPException(400, { message: "Missing Parameters: organizationId" });
        }

        const limitParam = c.req.query('limit');
        const offsetParam = c.req.query('offset');
        const limit = limitParam !== undefined ? Number(limitParam) : undefined;
        const offset = offsetParam !== undefined ? Number(offsetParam) : undefined;

        logger.debug({ organizationId, limit, offset }, `Request:`);

        const rows = await this.organizationUserService.getUsersByOrganization(organizationId, { limit, offset });
        const members = rows.map(({ user, membership }) => ({
            id: membership.id,
            user_id: user.id,
            organization_id: membership.organization_id,
            role: membership.role,
            first_name: user.first_name,
            last_name: user.last_name,
            normalized_name: user.normalized_name,
            description: user.description,
            created_at: membership.created_at,
            updated_at: membership.updated_at,
        }));

        logger.debug({ organizationId, count: members.length }, `Response:`);
        logger.info(`End method: ${this.constructor.name}.${this.getAll.name}`);

        return c.json(members);
    }

    /**
     * POST /organizations/:organization_id/users
     * Creates a new user and adds them to the organization in one step.
     *
     * @param c - Hono request context; expects an `organization_id` route
     * param and a JSON body with the user's profile fields plus an
     * optional `role` for their membership (defaults to `viewer`).
     * @returns JSON response with the created user, combined with their
     * `role` and membership `id`.
     * @throws {HTTPException} 400 if the `organization_id` param is missing.
     * @throws {HTTPException} 403 if the caller tries to hand out a role
     * ranked above their own (e.g. an `admin` adding a member as `owner`).
     */
    post = async (c: Context) => {
        logger.info(`Start method: ${this.constructor.name}.${this.post.name}`);

        const organizationId = c.req.param('organization_id');

        if (!organizationId) {
            throw new HTTPException(400, { message: "Missing Parameters: organizationId" });
        }

        const { role, ...userFields } = await c.req.json();
        const actorUserId = c.get('userId');

        logger.debug({ organizationId, userFields, role, actorUserId }, `Request:`);

        if (role) {
            const actorMembership = await this.organizationUserService.getByOrganizationAndUser(organizationId, actorUserId);
            if (!actorMembership || ROLE_RANK[role as OrganizationUserRole] > ROLE_RANK[actorMembership.role ?? "viewer"]) {
                logger.warn({ organizationId, actorUserId, role }, `${this.constructor.name}.${this.post.name}: Forbidden - cannot assign a role higher than your own`);
                throw new HTTPException(403, { message: "Forbidden: cannot assign a role higher than your own" });
            }
        }

        const user = await this.userService.create(userFields);
        const membership = await this.organizationUserService.create({ organization_id: organizationId, user_id: user.id, role });

        logger.debug({ organizationId, user, membership }, `Response:`);
        logger.info(`End method: ${this.constructor.name}.${this.post.name}`);

        return c.json({ ...toPublicUser(user), organization_id: organizationId, role: membership.role, membership_id: membership.id }, 201);
    }

    /**
     * PATCH /organizations/:organization_id/users/:user_id
     * Updates a member's role (or membership metadata) within the
     * organization. Does not touch the user's own profile fields - see
     * `PATCH /users/:id` for that.
     *
     * @param c - Hono request context; expects `organization_id` and
     * `user_id` route params and a JSON body with the membership fields to
     * update.
     * @returns JSON response with the updated membership row.
     * @throws {HTTPException} 400 if a route param is missing.
     * @throws {HTTPException} 403 if the caller is trying to change their
     * own role, change another `owner`'s role without being one themselves,
     * or assign a role ranked above their own.
     * @throws {HTTPException} 404 if the user isn't a member of the organization.
     */
    update = async (c: Context) => {
        logger.info(`Start method: ${this.constructor.name}.${this.update.name}`);

        const organizationId = c.req.param('organization_id');
        const userId = c.req.param('user_id');
        const actorUserId = c.get('userId');

        if (!organizationId || !userId) {
            throw new HTTPException(400, { message: "Missing Parameters: organizationId, userId" });
        }

        const body = await c.req.json();

        logger.debug({ organizationId, userId, body, actorUserId }, `Request:`);

        const membership = await this.organizationUserService.getByOrganizationAndUser(organizationId, userId);

        if (!membership) {
            logger.warn({ organizationId, userId }, `${this.constructor.name}.${this.update.name}: Membership not found`);
            throw new HTTPException(404, { message: "Membership not found" });
        }

        if (userId === actorUserId) {
            // No one - including an `owner` - may change their own role, so
            // an org can never lose its last owner/admin to a self-demotion.
            if (body.role) {
                logger.warn({ organizationId, userId }, `${this.constructor.name}.${this.update.name}: Forbidden - cannot change your own role`);
                throw new HTTPException(403, { message: "Forbidden: cannot change your own role" });
            }
        } else if (body.role) {
            // These two checks only gate the `role` field itself - editing
            // someone else's non-role metadata (e.g. `description`) needs
            // nothing beyond the route's own `requireRole('admin')`.
            const actorMembership = await this.organizationUserService.getByOrganizationAndUser(organizationId, actorUserId);
            const actorRole = actorMembership?.role ?? "viewer";
            const targetRole = membership.role ?? "viewer";

            // Owners are only touchable by other owners - otherwise any
            // admin+ may freely change a non-owner member's role, including
            // another admin's (two admins can change each other's roles).
            if (targetRole === "owner" && actorRole !== "owner") {
                logger.warn({ organizationId, userId, actorUserId }, `${this.constructor.name}.${this.update.name}: Forbidden - only an owner can modify another owner's role`);
                throw new HTTPException(403, { message: "Forbidden: only an owner can modify another owner's role" });
            }
            if (ROLE_RANK[body.role as OrganizationUserRole] > ROLE_RANK[actorRole]) {
                logger.warn({ organizationId, userId, actorUserId, role: body.role }, `${this.constructor.name}.${this.update.name}: Forbidden - cannot assign a role higher than your own`);
                throw new HTTPException(403, { message: "Forbidden: cannot assign a role higher than your own" });
            }
        }

        const updated = await this.organizationUserService.update(membership.id, body);

        logger.debug({ organizationId, userId, updated }, `Response:`);
        logger.info(`End method: ${this.constructor.name}.${this.update.name}`);

        return c.json(updated);
    }

    /**
     * DELETE /organizations/:organization_id/users/:user_id
     * Removes a user from the organization by deleting their membership
     * row. The user's account itself is untouched - see `DELETE /users/:id`
     * to delete the account entirely.
     *
     * @param c - Hono request context; expects `organization_id` and
     * `user_id` route params.
     * @returns JSON response with the deleted membership row.
     * @throws {HTTPException} 400 if a route param is missing.
     * @throws {HTTPException} 403 if the caller is trying to remove
     * themselves or a member ranked at or above them (e.g. an `admin`
     * removing another `admin` or the `owner`).
     * @throws {HTTPException} 404 if the user isn't a member of the organization.
     */
    delete = async (c: Context) => {
        logger.info(`Start method: ${this.constructor.name}.${this.delete.name}`);

        const organizationId = c.req.param('organization_id');
        const userId = c.req.param('user_id');
        const actorUserId = c.get('userId');

        if (!organizationId || !userId) {
            throw new HTTPException(400, { message: "Missing Parameters: organizationId, userId" });
        }

        logger.debug({ organizationId, userId, actorUserId }, `Request:`);

        const membership = await this.organizationUserService.getByOrganizationAndUser(organizationId, userId);

        if (!membership) {
            logger.warn({ organizationId, userId }, `${this.constructor.name}.${this.delete.name}: Membership not found`);
            throw new HTTPException(404, { message: "Membership not found" });
        }

        // Strictly-lower-rank-only, same as `update` above - this is also
        // what stops a member from removing themselves (equal rank to
        // themselves never passes), including an `owner`.
        const actorMembership = await this.organizationUserService.getByOrganizationAndUser(organizationId, actorUserId);
        if (!actorMembership || ROLE_RANK[actorMembership.role ?? "viewer"] <= ROLE_RANK[membership.role ?? "viewer"]) {
            logger.warn({ organizationId, userId, actorUserId }, `${this.constructor.name}.${this.delete.name}: Forbidden - cannot remove a member with an equal or higher role`);
            throw new HTTPException(403, { message: "Forbidden: cannot remove a member with an equal or higher role" });
        }

        const deleted = await this.organizationUserService.delete(membership.id);

        logger.debug({ organizationId, userId, deleted }, `Response:`);
        logger.info(`End method: ${this.constructor.name}.${this.delete.name}`);

        return c.json(deleted);
    }
}
