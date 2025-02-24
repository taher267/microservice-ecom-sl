import { Request, Response, NextFunction } from "express";
import { CartItemTOSchema } from "@/schemas";
import redis from "@/redis";
import { v4 as uuid } from "uuid";
import { CART_TTL } from "@/config";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body, headers, ip } = req;

    const ipAddress = (headers["x-forwarded-for"] || ip || "") as string;
    const userAgent = headers["user-agent"] || "";

    // Validate request body
    const { success, error, data } = CartItemTOSchema.safeParse(body);
    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }
    let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;
    // check if cart session id is persent in the request header and exists in the strore
    if (cartSessionId) {
      const exists = await redis.exists(`sessions:${cartSessionId}`);
      console.log(`Cart session redis`, exists);
      if (!exists) cartSessionId = null;
    }
    // if cart session id is not present, create a new one
    if (!cartSessionId) {
      cartSessionId = uuid();
      console.log(`New Session ID: `, cartSessionId);
      // set the cart session id in the redis store
      await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId);
      // set the cart session id in the response header
      res.setHeader("x-cart-session-id", cartSessionId);
    }
    // add item to the cart
    await redis.hset(
      `cart:${cartSessionId}`,
      data.productId,
      JSON.stringify({
        inventoryId: data.inventoryId,
        quantity: data.quantity,
      })
    );
    // TODO check inventory availability
    // TODO update the inventory

    res.status(200).json({ code: 200, message: "Item added to cart." });
  } catch (e) {
    next(e);
  }
};

export default addToCart;
