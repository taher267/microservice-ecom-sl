import { z } from "zod";
export const CartItemTOSchema = z
  .object({
    productId: z.string(),
    inventoryId: z.string(),
    quantity: z.number(),
  })
  .required();
