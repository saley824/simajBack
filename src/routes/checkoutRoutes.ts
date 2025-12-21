import express from "express";

import checkoutController from "../controllers/checkout_controller";
import { checkToken } from "../middlewares/auth_middleware";

const router = express.Router();

router
    .route("/info")
    .post(checkToken, checkoutController.getCheckoutInfo);

export default router;
