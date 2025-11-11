import express from "express";

import productController from "../controllers/product_controller";

const router = express.Router();

router.get("/countryProducts", productController.getAllProductsForCountry);
router.get("/regionProducts", productController.getAllProductsForRegion);

export default router;
