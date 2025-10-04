import prisma from "@/lib/prisma";

export const getCurrentUserRolesByFormId = async (
  userId: string,
  formId: string
) => {
  const userForms = await prisma.userForm.findMany({
    where: {
      userId,
      formId,
    },
  });
  return userForms.map((userForm) => userForm.role);
};
