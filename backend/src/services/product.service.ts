import { Prisma } from "@prisma/client";
import prisma from "../db/client.js";

export type ProductDTO = {
  name: string;
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
};

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: productSelect,
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    select: productSelect,
  });
}

export async function createProduct(data: ProductDTO) {
  return prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      description: data.description,
      imageUrl: data.imageUrl,
    },
    select: productSelect,
  });
}

export async function updateProduct(id: string, data: ProductDTO) {
  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      description: data.description,
      imageUrl: data.imageUrl,
    },
    select: productSelect,
  });
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}

export function isDeleteBlockedByRelation(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return e.code === "P2003" || e.code === "P2014";
}

export function isRecordNotFoundError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
}
