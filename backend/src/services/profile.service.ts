import prisma from "../db/client.js";

const profileSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  shippingAddress: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type ProfileDTO = {
  name: string | null;
  phone: string | null;
  shippingAddress: string | null;
};

export async function getProfileByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
}

export async function updateProfile(userId: string, data: ProfileDTO) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      shippingAddress: data.shippingAddress,
    },
    select: profileSelect,
  });
}
