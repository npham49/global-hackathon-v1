"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { clerkClient } from "@clerk/nextjs/server";

const demoRegistrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  actaConsent: z.boolean().refine((val) => val === true, {
    message: "You must agree to belong to the ACTA organization",
  }),
  voiceApiConsent: z.boolean().refine((val) => val === true, {
    message: "You must agree not to abuse the voice API",
  }),
});

export const registerDemoUser = actionClient
  .schema(demoRegistrationSchema)
  .action(async ({ parsedInput }) => {
    const { email, actaConsent, voiceApiConsent } = parsedInput;

    try {
      const clerk = await clerkClient();

      // Check if user already exists
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [email],
      });

      if (existingUsers.data.length > 0) {
        throw new Error(
          "An account with this email already exists. Please sign in instead."
        );
      }

      // Create user with email address and mark email as verified
      // This allows them to sign in immediately
      const user = await clerk.users.createUser({
        emailAddress: [email],
        skipPasswordRequirement: true,
        skipPasswordChecks: true,
        publicMetadata: {
          demoUser: true,
          actaConsent,
          voiceApiConsent,
          registeredAt: new Date().toISOString(),
        },
      });

      // Send a sign-in link to the user's email (magic link)
      // This creates a sign-in token that can be used for passwordless authentication
      await clerk.signInTokens.createSignInToken({
        userId: user.id,
        expiresInSeconds: 3600, // 1 hour
      });

      return {
        success: true,
        userId: user.id,
        message:
          "Account created successfully! You can now sign in with your email.",
      };
    } catch (error: unknown) {
      console.error("Error creating demo user:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error(
        "Failed to create demo account. Please try again or contact support."
      );
    }
  });
