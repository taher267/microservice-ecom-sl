import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { OrderSchema, CartItemSchema } from "@/schemas";
import prisma from "@/prisma";
import { CART_SERVICE, EMAIL_SERVICE, PRODUCT_SERVICE } from "@/config";
import { z } from "zod";
// psodo code https://prnt.sc/K5Drpn9wuahz
const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { success, error, data } = OrderSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        error: error.errors,
      });
      return;
    }

    // Ensure parseBody.data is defined
    if (!data) {
      res.status(400).json({
        error: "Request body is missing required data.",
      });
      return;
    }

    // get cart details
    const { data: cartData } = await axios.get(`${CART_SERVICE}/cart/me`, {
      headers: {
        "x-cart-session-id": data.cartSessionId,
      },
    });
    const cartItems = z.array(CartItemSchema).safeParse(cartData.data);
    if (!cartItems.success) {
      res.status(400).json({
        error: cartItems.error.errors,
      });
      return;
    }
    if (!cartItems.data?.length) {
      res.status(400).json({
        code: 400,
        message: `Cart is empty!`,
      });
      return;
    }
    // get product details from cart item
    const productDetails = await Promise.all(
      cartItems.data.map(async (item) => {
        console.log(item.productId);
        const { data: product } = await axios.get(
          `${PRODUCT_SERVICE}/products/${item.productId}`
        );
        return {
          productId: product.id as string,
          productName: product.name as string,
          sku: product.sku as string,
          price: product.price as number,
          quantity: item.quantity as number,
          total: product.price * item.quantity,
        };
      })
    );

    const subtotal = productDetails.reduce((a, c) => a + c.total, 0);
    // TODO will handle tax calculation later
    const tax = 0;
    const grandTotal = subtotal + tax;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        subtotal,
        tax,
        grandTotal,
        orderItems: { create: productDetails.map((item) => ({ ...item })) },
      },
      // select: {
      //   id: true,
      //   quantity: true,
      // },
    });
    // clear cart
    axios.get(`${CART_SERVICE}/cart/clear`, {
      headers: {
        "x-cart-session-id": data.cartSessionId,
      },
    });
    axios.post(`${EMAIL_SERVICE}/emails/send`, {
      recipient: data.userEmail,
      subject: "Order confirmation.",
      body: `Thank you for your order. Your order id is ${order.id}. Your order total is ${grandTotal}`,
      source: "Checkout",
    });

    res.status(201).json({ code: 201, data: order }); // Send the created order as a response
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export default checkout;
