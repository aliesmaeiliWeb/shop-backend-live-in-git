import { Request, Response } from "express";
import { productService } from "../../../services/db/product.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class ProductController {
  //+ add product
  public async create(req: Request, res: Response) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let mainImage = "";
    if (files && files["mainImage"] && files["mainImage"].length > 0) {
      mainImage = `/image/products/${files["mainImage"][0].filename}`;
    }

    //? get gallery images
    let galleryImages: string[] = [];
    if (files && files["galleryImages"] && files["galleryImages"].length > 0) {
      galleryImages = files["galleryImages"].map(
        (file) => `/image/products/${file.filename}`
      );
    }

    //? Parse Body Data (Multer sends arrays/objects as strings)
    const bodyData = { ...req.body };

    //? parse skus json string
    if (bodyData.skus && typeof bodyData.skus === "string") {
      try {
        bodyData.skus = JSON.parse(bodyData.skus);
      } catch (e) {
        bodyData.skus = [];
      }
    }

    //? attributeValueIds json string
    if (
      bodyData.attributeValueIds &&
      typeof bodyData.attributeValueIds === "string"
    ) {
      try {
        bodyData.attributeValueIds = JSON.parse(bodyData.attributeValueIds);
      } catch (e) {
        bodyData.attributeValueIds = [];
      }
    }

    //? call service
    const product = await productService.createProduct(
      bodyData,
      req.currentUser.id.toString(),
      mainImage,
      galleryImages
    );

    res.status(HTTP_STATUS.create).json({
      message: "Product created successfully",
      data: product,
    });
  }

  public async update(req: Request, res: Response) {
    let mainImage: string | undefined = undefined;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files && files["mainImage"] && files["mainImage"].length > 0) {
      mainImage = `/image/products/${files["mainImage"][0].filename}`;
    }

    //? check gallery images
    let galleryImages: string[] = [];
    if (files && files["galleryImages"] && files["galleryImages"].length > 0) {
      galleryImages = files["galleryImages"].map(
        (file) => `/image/products/${file.filename}`
      );
    }

    //? parse body data
    const bodyData = { ...req.body };

    //? parse json string skus if send as string
    if (bodyData.skus && typeof bodyData.skus === "string") {
      try { bodyData.skus = JSON.parse(bodyData.skus); } catch (e) { bodyData.skus = [] }
    }

    const product = await productService.updateProduct(
      req.params.id,
      bodyData,
      req.currentUser.id.toString(),
      mainImage,
      galleryImages,
    );

    res.status(HTTP_STATUS.ok).json({
      message: "Product updated successfully",
      data: product,
    });
  }

  public async getAll(req: Request, res: Response) {
    const result = await productService.getAll(req.query);
    res.status(HTTP_STATUS.ok).json(result);
  }

  // Get One with Details
  public async getOne(req: Request, res: Response) {
    const product = await productService.getOne(req.params.id);
    res.status(HTTP_STATUS.ok).json({ data: product });
  }

  // Soft Delete
  public async delete(req: Request, res: Response) {
    console.log(req.currentUser.role, req.currentUser.id.toString());
    
    await productService.softDelete(
      req.params.id,
      req.currentUser.id.toString(),
      req.currentUser.role
    );
    res.status(HTTP_STATUS.ok).json({ message: "Product deleted successfully" });
  }

  // Add Images to Gallery
  public async addGalleryImages(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map((f) => `/image/products/${f.filename}`);

    await productService.addImagesToGallery(req.params.id, imageUrls);
    res.status(HTTP_STATUS.create).json({ message: "Images added to gallery" });
  }

  // Remove Image from Gallery
  public async deleteGalleryImage(req: Request, res: Response) {
    await productService.removeGalleryImage(req.params.galleryId);
    res.status(HTTP_STATUS.ok).json({ message: "Image removed from gallery" });
  }

  // Add SKU
  public async addSku(req: Request, res: Response) {
    const sku = await productService.addSkuToProduct(req.params.id, req.body);
    res.status(HTTP_STATUS.create).json({ message: "SKU added", data: sku });
  }
}

export const productController: ProductController = new ProductController();
