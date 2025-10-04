// Type declarations for Prisma generated files
// This prevents TypeScript from deeply analyzing the generated folder

declare module "../../prisma/generated/client" {
  export * from "@prisma/client";
}

declare module "../../../prisma/generated/client" {
  export * from "@prisma/client";
}

declare module "../../prisma/generated" {
  export * from "@prisma/client";
}

declare module "../../../prisma/generated/schema/schemas" {
  import type { z } from "zod";
  export const FeedbackFormCreateOneSchema: z.ZodType<unknown>;
  export const FeedbackFormUpdateOneSchema: z.ZodType<unknown>;
  export const FeedbackFormDeleteOneSchema: z.ZodType<unknown>;
  export const FeedbackFormFindUniqueSchema: z.ZodType<unknown>;
  export const SubmissionCreateOneSchema: z.ZodType<unknown>;
  export const FormTokenCreateOneSchema: z.ZodType<unknown>;
}

declare module "../../../../prisma/generated/schema/schemas" {
  export * from "../../../prisma/generated/schema/schemas";
}
