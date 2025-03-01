import { Status } from "@prisma/client";
import { z } from "zod";
export const ProductCreateDTOSchema = z
  .object({
    name: z.string().min(3).max(255),
    description: z.string().min(3).max(1000),
    sku: z.string().min(3).max(10),
    price: z.number().int().optional().default(0),
    status: z.nativeEnum(Status).optional().default(Status.DRAFT),
  })
  .required();
export const ProductUpdateDTOSchema = ProductCreateDTOSchema.omit({
  sku: true,
}).partial();
