"use server";

import { actionClient } from "@/lib/safe-action";
import { getFormByToken, createSubmission } from "@/data-access/forms";
import { z } from "zod";
import { headers } from "next/headers";
import { checkRateLimit } from "@vercel/firewall";

export const submitFormAction = actionClient
  .inputSchema(
    z.object({
      formId: z.string(),
      token: z.string(),
      data: z.record(z.string(), z.union([z.string(), z.number()])),
    })
  )
  .action(async ({ parsedInput }) => {
    // Rate limiting check: 5 submissions per 60 seconds per IP
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    const { rateLimited } = await checkRateLimit(`submission_${ip}`);

    if (rateLimited) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // Validate token and get form
    const form = await getFormByToken(parsedInput.formId, parsedInput.token);

    if (!form) {
      throw new Error("Invalid or expired token");
    }

    // Create submission
    const submission = await createSubmission(
      parsedInput.formId,
      parsedInput.data as Record<string, string | number>
    );

    return { success: true, submissionId: submission.id };
  });

export const validateTokenAction = actionClient
  .inputSchema(z.object({ formId: z.string(), token: z.string() }))
  .action(async ({ parsedInput }) => {
    const form = await getFormByToken(parsedInput.formId, parsedInput.token);
    return { valid: !!form };
  });
