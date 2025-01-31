import { ActionType } from "@prisma/client";
import { z } from "zod";
export const InventoryCreateDTOSchema = z
  .object({
    productId: z.string(),
    sku: z.string(),
    quantity: z.number().int().optional().default(0),
  })
  .required();

export const InventoryUpdateDTOSchema = z
  .object({
    quantity: z.number().int().optional().default(0),
    actionType: z.nativeEnum(ActionType),
  })
  .required();
