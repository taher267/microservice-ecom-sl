import { Request, Response, NextFunction } from "express";
import { CartItemTOSchema } from "@/schemas";
import redis from "@/redis";
import { v4 as uuid } from "uuid";
import { CART_TTL, INVENTORY_SERVICE } from "@/config";
import axios from "axios";
/*const sessionsId = "sessions:a093994f-dc17-4579-97e7-03dc1c8be0c6";
redis
  .hgetall(sessionsId.replace("sessions", "cart"))
  .then(async (carts) => {
    try {
      Object.keys(carts).map((key) => {
        console.log(carts[key]);
      });
    } catch (e) {
      console.log(e);
    }
  })
  .catch(console.error);*/

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;

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
    console.log({ cartSessionId });
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
      // const exists = await redis.exists(`sessions:${cartSessionId}`);
      // console.log(`Cart session redis after setex`, exists);
      // set the cart session id in the response header
      res.setHeader("x-cart-session-id", cartSessionId);
    }
    // check if the inventory is available
    const { data: resData } = await axios.get(
      `${INVENTORY_SERVICE}/inventories/${data.inventoryId}`
    );
    // console.log(typeof data?.quantity);
    if (Number(resData.quantity) < Number(data.quantity)) {
      res.status(400).json({ code: 400, message: "Inventory not available." });
      return;
    }

    // add item to the cart
    // TODO if the product already exists in the cart
    // Logic: data.quantity- existing quantity
    await redis.hset(
      `cart:${cartSessionId}`,
      data.productId,
      JSON.stringify({
        inventoryId: data.inventoryId,
        quantity: data.quantity,
      })
    );
    // update the inventory
    await axios.put(`${INVENTORY_SERVICE}/inventories/${data.inventoryId}`, {
      quantity: data.quantity,
      actionType: "OUT",
    });

    res
      .status(200)
      .json({ code: 200, message: "Item added to cart.", cartSessionId });
  } catch (e) {
    next(e);
  }
};

export default addToCart;
