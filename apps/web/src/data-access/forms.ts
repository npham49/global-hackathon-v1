import prisma from "@/lib/prisma";
import { Prisma, Role } from "../../prisma/generated";

// Get forms where the user is ADMIN or EDITOR
export const getUserForms = async (userId: string) => {
  return prisma.feedbackForm.findMany({
    where: {
      userForms: {
        some: {
          userId,
          role: { in: [Role.ADMIN, Role.EDITOR] },
        },
      },
    },
  });
};

// Create a form and assign the user as ADMIN in a transaction
export const createForm = async (
  userId: string,
  data: Prisma.FeedbackFormCreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const form = await tx.feedbackForm.create({
      data: {
        ...data,
        createdByUser: { connect: { id: userId } },
        updatedByUser: { connect: { id: userId } },
      },
    });

    await tx.userForm.create({
      data: {
        userId: userId,
        formId: form.id,
        role: Role.ADMIN,
      },
    });

    return form;
  });
};
