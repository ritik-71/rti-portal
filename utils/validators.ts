import { z } from 'zod';

export const ApplicationSchema = z.object({
  applicant: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  status: z.enum(["Pending", "Approved", "Rejected"]).default("Pending"),
  document_url: z.string().url("Invalid URL").optional().nullable(),
  remarks: z.string().max(1000, "Remarks too long").optional().nullable(),
});

export const StatusUpdateSchema = z.object({
  status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
  remarks: z.string().max(1000, "Remarks too long").optional().nullable(),
});
