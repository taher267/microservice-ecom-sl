import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import axios from "axios";
import { INVENTORY_URL } from "@/config";

const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    // Retrive product
    const product = await prisma.product.findFirst({
      where: { id },
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        inventoryId: true,
      },
    });
    if (!product) {
      res.status(404).json({
        messae: `Product not found`,
        code: 404,
      });
      return;
    }

    // if not exist inventory id of Product create fast
    const inventoryId = product.inventoryId;
    if (!inventoryId) {
      const productId = product.id;
      const { data: inventory } = await axios.post(
        `${INVENTORY_URL}/inventories`,
        {
          productId,
          sku: product.sku,
          // quantity: 5,
        }
      );
      const inventoryId = inventory.id;
      console.log(
        `Alhamdu lillah, Inventory created Successfully`,
        inventory?.id
      );
      // Update product & store inventory id
      await prisma.product.update({
        where: { id },
        data: {
          inventoryId,
        },
      });
      console.log(
        `Alhamdu lillah, Product updated Successfully with inventory id`,
        inventoryId
      );
      const stock = inventory.quantity || 0;
      res.status(200).json({
        code: 200,
        ...product,
        inventoryId,
        stock,
        stockStatus: stock > 0 ? "In stock" : "Out of stock",
      });
      return;
    }
    const { data: inventory } = await axios.get(
      `${INVENTORY_URL}/inventories/${inventoryId}`
    );

    const stock = inventory.quantity || 0;
    res.status(200).json({
      code: 200,
      ...product,
      inventoryId,
      stock,
      stockStatus: stock > 0 ? "In stock" : "Out of stock",
    });
    return;
  } catch (e) {
    next(e);
  }
};

export default getProductDetails;
