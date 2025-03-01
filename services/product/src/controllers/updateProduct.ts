import { Request, Response, NextFunction } from "express";
import { ProductUpdateDTOSchema } from "@/schemas";
import prisma from "@/prisma";

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { success, error, data } = ProductUpdateDTOSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({
        error: error.errors,
        message: "Invalid request body!",
      });
      return;
    }
    console.log(req.params.id);
    // Check if the product not exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existingProduct) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    // Create product
    const updateProduct = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });

    res.status(200).json({ code: 200, data: updateProduct });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export default updateProduct;
