import { describe, it, expect, mock, beforeEach } from "bun:test";
import { OrganizationUserController } from "../../src/controllers";
import type { UserService, OrganizationUserService } from "../../src/services";
import { createMockContext, expectHttpException } from "../helpers/mockContext";

describe("OrganizationUserController", () => {
    let userService: UserService;
    let organizationUserService: OrganizationUserService;
    let controller: OrganizationUserController;

    const createdUser = { id: "user-2", email: "new@example.com", first_name: "New", last_name: "Member", password_hash: null, description: null, normalized_name: null };

    // Actor is an `admin` acting on `user-2`'s (a `viewer`) membership - the
    // baseline "allowed" shape for update/delete/post. Individual tests
    // override roles via `mockImplementationOnce` to exercise the rank
    // checks (self-change, equal/higher rank, role-escalation).
    const actorMembership = { id: "actor-member-1", organization_id: "org-1", user_id: "actor-1", role: "admin", created_at: new Date(), updated_at: null };
    const membership = { id: "member-1", organization_id: "org-1", user_id: "user-2", role: "viewer", created_at: new Date(), updated_at: null };

    beforeEach(() => {
        userService = {
            create: mock(async () => createdUser),
        } as unknown as UserService;

        organizationUserService = {
            getUsersByOrganization: mock(async () => []),
            create: mock(async () => membership),
            getByOrganizationAndUser: mock(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return actorMembership;
                if (userId === "user-2") return membership;
                return null;
            }),
            update: mock(async () => ({ ...membership, role: "editor" })),
            delete: mock(async () => membership),
        } as unknown as OrganizationUserService;

        controller = new OrganizationUserController(userService, organizationUserService);
    });

    describe("getAll", () => {
        it("400s when the organization_id param is missing", async () => {
            const ctx = createMockContext({ params: {} });
            await expectHttpException(controller.getAll(ctx), 400, "organizationId");
        });

        it("maps membership rows into a flattened member list", async () => {
            (organizationUserService.getUsersByOrganization as any).mockImplementationOnce(async () => [
                {
                    user: { id: "user-2", first_name: "New", last_name: "Member", normalized_name: null, description: null },
                    membership: { id: "member-1", organization_id: "org-1", role: "viewer", created_at: new Date(), updated_at: null },
                },
            ]);

            const ctx = createMockContext({ params: { organization_id: "org-1" } });
            const result: any = await controller.getAll(ctx);

            expect(result.body).toEqual([
                {
                    id: "member-1",
                    user_id: "user-2",
                    organization_id: "org-1",
                    role: "viewer",
                    first_name: "New",
                    last_name: "Member",
                    normalized_name: null,
                    description: null,
                    created_at: expect.any(Date),
                    updated_at: null,
                },
            ]);
        });
    });

    describe("post", () => {
        it("400s when the organization_id param is missing", async () => {
            const ctx = createMockContext({ params: {}, body: {} });
            await expectHttpException(controller.post(ctx), 400, "organizationId");
        });

        it("creates a user and adds them to the organization", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1" }, body: { email: "new@example.com", role: "viewer" }, variables: { userId: "actor-1" } });
            const result: any = await controller.post(ctx);

            expect(userService.create).toHaveBeenCalledWith({ email: "new@example.com" });
            expect(organizationUserService.create).toHaveBeenCalledWith({ organization_id: "org-1", user_id: "user-2", role: "viewer" });
            expect(result.status).toBe(201);
            expect(result.body).toMatchObject({ email: "new@example.com", organization_id: "org-1", role: "viewer", membership_id: "member-1" });
            expect(result.body).not.toHaveProperty("password_hash");
        });

        it("allows creating a member with no role (defaults downstream)", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1" }, body: { email: "new@example.com" }, variables: { userId: "actor-1" } });
            const result: any = await controller.post(ctx);

            expect(result.status).toBe(201);
        });

        it("403s when the caller tries to assign a role higher than their own", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1" }, body: { email: "new@example.com", role: "owner" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.post(ctx), 403, "cannot assign a role higher than your own");
            expect(userService.create).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("400s when a route param is missing", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1" }, body: {} });
            await expectHttpException(controller.update(ctx), 400, "userId");
        });

        it("404s when the user isn't a member of the organization", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementationOnce(async () => null);
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, body: { role: "editor" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.update(ctx), 404, "Membership not found");
        });

        it("updates the membership role when the caller outranks the target", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, body: { role: "editor" }, variables: { userId: "actor-1" } });
            const result: any = await controller.update(ctx);

            expect(organizationUserService.update).toHaveBeenCalledWith("member-1", { role: "editor" });
            expect(result.body.role).toBe("editor");
        });

        it("403s when a member tries to change their own role", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "actor-1" }, body: { role: "editor" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.update(ctx), 403, "cannot change your own role");
            expect(organizationUserService.update).not.toHaveBeenCalled();
        });

        it("allows a member to update their own non-role fields", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "actor-1" }, body: { description: "hi" }, variables: { userId: "actor-1" } });
            const result: any = await controller.update(ctx);

            expect(organizationUserService.update).toHaveBeenCalledWith("actor-member-1", { description: "hi" });
            expect(result.status).toBe(200);
        });

        it("allows one admin to change another admin's role", async () => {
            // Both the actor and the target are `admin` here.
            (organizationUserService.getByOrganizationAndUser as any).mockImplementation(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return actorMembership;
                if (userId === "user-2") return { ...membership, role: "admin" };
                return null;
            });
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, body: { role: "viewer" }, variables: { userId: "actor-1" } });
            const result: any = await controller.update(ctx);

            expect(organizationUserService.update).toHaveBeenCalledWith("member-1", { role: "viewer" });
            expect(result.status).toBe(200);
        });

        it("403s when a non-owner tries to change an owner's role", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementation(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return actorMembership; // admin
                if (userId === "user-2") return { ...membership, role: "owner" };
                return null;
            });
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, body: { role: "admin" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.update(ctx), 403, "only an owner can modify another owner's role");
            expect(organizationUserService.update).not.toHaveBeenCalled();
        });

        it("allows a non-owner admin to update an owner's non-role metadata", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementation(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return actorMembership; // admin
                if (userId === "user-2") return { ...membership, role: "owner" };
                return null;
            });
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, body: { description: "hi" }, variables: { userId: "actor-1" } });
            const result: any = await controller.update(ctx);

            expect(organizationUserService.update).toHaveBeenCalledWith("member-1", { description: "hi" });
            expect(result.status).toBe(200);
        });

        it("allows an owner to change another owner's role", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementation(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return { ...actorMembership, role: "owner" };
                if (userId === "user-2") return { ...membership, role: "owner" };
                return null;
            });
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, body: { role: "admin" }, variables: { userId: "actor-1" } });
            const result: any = await controller.update(ctx);

            expect(organizationUserService.update).toHaveBeenCalledWith("member-1", { role: "admin" });
            expect(result.status).toBe(200);
        });

        it("403s when the caller tries to assign a role higher than their own", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, body: { role: "owner" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.update(ctx), 403, "cannot assign a role higher than your own");
            expect(organizationUserService.update).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("400s when a route param is missing", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1" } });
            await expectHttpException(controller.delete(ctx), 400, "userId");
        });

        it("404s when the user isn't a member of the organization", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementationOnce(async () => null);
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.delete(ctx), 404, "Membership not found");
        });

        it("removes the membership when the caller outranks the target", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, variables: { userId: "actor-1" } });
            const result: any = await controller.delete(ctx);

            expect(organizationUserService.delete).toHaveBeenCalledWith("member-1");
            expect(result.body).toEqual(membership);
        });

        it("403s when a member tries to remove themselves", async () => {
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "actor-1" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.delete(ctx), 403, "cannot remove a member with an equal or higher role");
            expect(organizationUserService.delete).not.toHaveBeenCalled();
        });

        it("403s when the caller doesn't outrank the target (an admin can't remove another admin)", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementation(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return actorMembership; // admin
                if (userId === "user-2") return { ...membership, role: "admin" };
                return null;
            });
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.delete(ctx), 403, "cannot remove a member with an equal or higher role");
        });

        it("403s when an admin tries to remove the owner", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementation(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return actorMembership; // admin
                if (userId === "user-2") return { ...membership, role: "owner" };
                return null;
            });
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, variables: { userId: "actor-1" } });
            await expectHttpException(controller.delete(ctx), 403, "cannot remove a member with an equal or higher role");
        });

        it("allows an owner to remove an admin", async () => {
            (organizationUserService.getByOrganizationAndUser as any).mockImplementation(async (_organizationId: string, userId: string) => {
                if (userId === "actor-1") return { ...actorMembership, role: "owner" };
                if (userId === "user-2") return { ...membership, role: "admin" };
                return null;
            });
            const ctx = createMockContext({ params: { organization_id: "org-1", user_id: "user-2" }, variables: { userId: "actor-1" } });
            const result: any = await controller.delete(ctx);

            expect(organizationUserService.delete).toHaveBeenCalledWith("member-1");
            expect(result.status).toBe(200);
        });
    });
});
