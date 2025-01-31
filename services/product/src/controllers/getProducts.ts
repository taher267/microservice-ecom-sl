import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import axios from "axios";
// import { INVENTORY_URL } from "@/config";

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Retrive products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        inventoryId: true,
      },
    });
    // TODO implement pagination
    // TODO implement filtering
    res.status(200).json(products);
  } catch (e) {
    next(e);
  }
};

export default getProducts;
