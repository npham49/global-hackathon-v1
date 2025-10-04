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

export const updateForm = async (
  formId: string,
  data: Prisma.FeedbackFormUpdateInput
) => {
  return prisma.feedbackForm.update({
    where: { id: formId },
    data,
  });
};

export const getFormById = async (formId: string) => {
  return prisma.feedbackForm.findUnique({
    where: { id: formId },
  });
};

export const getFormSubmissions = async (formId: string) => {
  return prisma.submission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
  });
};

export const getActiveFormToken = async (formId: string) => {
  return prisma.formToken.findFirst({
    where: {
      formId,
      expiry: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createFormToken = async (
  formId: string,
  token: string,
  expiry: Date,
  createdBy: string
) => {
  return prisma.formToken.create({
    data: {
      token,
      formId,
      expiry,
      createdBy,
    },
  });
};

export const deleteAllFormTokens = async (formId: string) => {
  return prisma.formToken.deleteMany({
    where: { formId },
  });
};
