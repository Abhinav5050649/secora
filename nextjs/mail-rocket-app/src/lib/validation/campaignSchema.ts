import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().optional(),
  start_time: z.string().optional(),
  identity_id: z.string().optional(),
  description: z.string().optional(),
});
export type CampaignFormValues = z.infer<typeof campaignSchema>;
