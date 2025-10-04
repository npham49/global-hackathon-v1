import prisma from "@/lib/prisma";

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const createUser = async (id: string) => {
  return prisma.user.create({
    data: { id },
  });
};
