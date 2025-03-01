import { Request, Response, NextFunction } from "express";
import redis from "@/redis";

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;
    if (!cartSessionId) {
      res.status(200).json({ code: 200, message: `Cart is empty!` });
      return;
    }
    delete req.headers["x-cart-session-id"];
    // check if the session id exists in the stroe
    const exist = await redis.exists(`sessions:${cartSessionId}`);
    if (!exist) {
      // delete req.headers["x-cart-session-id"];
      res.status(200).json({ code: 200, message: `Cart is empty.` });
      return;
    }

    // clear the cart
    await redis.del(`sessions:${cartSessionId}`);
    await redis.del(`cart:${cartSessionId}`);
    res.status(200).json({ code: 200, message: `Cart cleared.` });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export default clearCart;
