import { z } from "zod";
export const OrderSchema = z
  .object({
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string().email(),
    cartSessionId: z.string(),
  })
  .required();

export const CartItemSchema = z
  .object({
    productId: z.string(),
    inventoryId: z.string(),
    quantity: z.number(),
  })
  .required();
