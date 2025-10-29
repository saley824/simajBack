import express from "express";

import checkoutController from "../controllers/checkout_controller";

const router = express.Router();

router.post("/info", checkoutController.getCheckoutInfo);

export default router;
