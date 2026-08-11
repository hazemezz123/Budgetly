import { z } from "zod";

export const createHouseSchema = z.object({
  name: z.string().min(3, "اسم البيت يجب أن يكون 3 حروف على الأقل"),
  password: z.string().min(4, "كلمة سر البيت يجب أن تكون 4 حروف على الأقل"),
});

export const joinHouseSchema = z.object({
  password: z.string().min(1, "كلمة السر مطلوبة"),
});
