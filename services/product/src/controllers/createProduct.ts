import { Request, Response, NextFunction } from "express";
import { ProductCreateDTOSchema } from "@/schemas";
import prisma from "@/prisma";
import axios from "axios";
import { INVENTORY_URL } from "@/config";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { success, error, data } = ProductCreateDTOSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }
    // Check if product with the same sku already exists
    const existingProduct = await prisma.product.findFirst({
      where: { sku: data.sku },
    });
    if (existingProduct) {
      res.status(400).json({
        message: "Product with the same SKU already exists",
      });
      return;
    }
    // Create product
    const product = await prisma.product.create({
      data,
      // select: {
      //   id: true,
      // },
    });
    const productId = product.id;
    console.log(`Alhamdu lillah, Product created Successfully`, productId);
    // Create inventory record for the product
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId,
        sku: data.sku,
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
      where: { id: productId },
      data: {
        inventoryId,
      },
    });
    console.log(
      `Alhamdu lillah, Product updated Successfully with inventory id`,
      inventoryId
    );
    res.status(201).json({ ...product, inventoryId });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export default createProduct;
