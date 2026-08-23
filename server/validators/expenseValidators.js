import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z.string().min(1, "عنوان المصروف مطلوب"),
  description: z.string().optional(),
  category: z.string().min(1, "القسم مطلوب"),
  totalAmount: z.number().positive("المبلغ يجب أن يكون أكبر من 0"),
  splitType: z.enum(["equal", "specific", "custom"]),
  splits: z
    .array(
      z.object({
        user: z.string(),
        amount: z.number().min(0),
      })
    )
    .optional(),
  selectedUsers: z.array(z.string()).optional(),
  customSplits: z
    .array(
      z.object({
        user: z.string(),
        amount: z.number().min(0),
      })
    )
    .optional(),
  payer: z.string().optional(),
});
