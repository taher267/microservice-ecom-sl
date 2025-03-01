import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { headers } = req;
    let cartSessionId = (headers["x-cart-session-id"] as string) || null;
    if (!cartSessionId) {
      res.status(200).json({ code: 200, data: [] });
      return;
    }
    const session = await redis.exists(`sessions:${cartSessionId}`);
    if (!session) {
      await redis.del(`cart:${cartSessionId}`);
      res.status(200).json({ code: 200, data: [] });
      return;
    }
    const items = await redis.hgetall(`cart:${cartSessionId}`);
    if (!Object.keys(items)?.length) {
      res.status(200).json({ code: 200, data: [] });
      return;
    }

    // format the items
    const formattedItems = Object.keys(items).map((key) => {
      const { inventoryId, quantity } = JSON.parse(items[key]) as {
        inventoryId: string;
        quantity: number;
      };
      return {
        inventoryId,
        quantity,
        productId: key,
      };
    });
    res.status(200).json({ code: 200, data: formattedItems });
  } catch (e) {
    next(e);
  }
};

export default getMyCart;
