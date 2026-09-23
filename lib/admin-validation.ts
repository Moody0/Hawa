import { z } from "zod";
import { isValidSyrianPhone, normalizeSyrianPhone } from "./order-validation";

const rawHtmlTag = /<\/?[a-z][^>]*>/i;
const safeOptionalUrl = z.string().trim().max(2048).refine(
  (value) => value === "" || value.startsWith("/") || /^https:\/\//i.test(value),
  "Use an HTTPS URL or a same-origin path",
);

export const identifierSchema = z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);
export const archiveReasonSchema = z.string().trim().min(3).max(500);

export const blogPostMutationSchema = z.object({
  id: identifierSchema.optional(),
  title: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().max(200).optional().nullable(),
  category: z.string().trim().min(1).max(100).optional(),
  categoryAr: z.string().trim().max(100).optional().nullable(),
  excerpt: z.string().trim().max(500).optional().nullable(),
  excerptAr: z.string().trim().max(500).optional().nullable(),
  content: z.string().trim().min(1).max(50_000).refine((value) => !rawHtmlTag.test(value), "Raw HTML is not allowed"),
  contentAr: z.string().trim().max(50_000).refine((value) => !rawHtmlTag.test(value), "Raw HTML is not allowed").optional().nullable(),
  image: safeOptionalUrl.optional().nullable(),
  isPublished: z.boolean().optional(),
}).strict();

export const customerStatusSchema = z.object({
  id: identifierSchema,
  isActive: z.boolean(),
}).strict();

export const customerAdminUpdateSchema = z.object({
  id: identifierSchema,
  shopName: z.string().trim().min(2, "يرجى إدخال اسم المحل (حرفين على الأقل). أقصى حد 100 حرف.").max(100, "اسم المحل يجب ألا يتجاوز 100 حرف."),
  ownerName: z.string().trim().min(2, "يرجى إدخال اسم صاحب الحساب (حرفين على الأقل). أقصى حد 100 حرف.").max(100, "اسم صاحب الحساب يجب ألا يتجاوز 100 حرف."),
  phone: z.string().trim().min(1, "يرجى إدخال رقم الهاتف.").max(50, "رقم الهاتف المدخل طويل جداً.")
    .transform(normalizeSyrianPhone)
    .refine(isValidSyrianPhone, "يرجى إدخال رقم هاتف سوري صالح."),
  city: z.string().trim().min(2, "يرجى إدخال المحافظة أو المنطقة.").max(50, "اسم المحافظة أو المنطقة طويل جداً."),
  address: z.string().trim().min(4, "يرجى إدخال العنوان بالتفصيل.").max(300, "العنوان طويل جداً."),
  notes: z.string().trim().max(500, "ملاحظات التوصيل يجب ألا تتجاوز 500 حرف.").nullable(),
  isActive: z.boolean(),
}).strict();

export const reviewStatusSchema = z.object({ isApproved: z.boolean() }).strict();

export function zodFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    (fields[key] ||= []).push(issue.message);
  }
  return fields;
}
