import express from "express";

import paymentController from "../controllers/payment_controller";
import { checkToken } from "../middlewares/auth_middleware";
const router = express.Router();


router
    .route("/init")
    .post(checkToken, paymentController.createTransaction);

router.post("/handle-Monri", paymentController.handleMonriCallback);
router.post("/handle-with-balance", paymentController.handlePaymentWithBalance);

export default router;
