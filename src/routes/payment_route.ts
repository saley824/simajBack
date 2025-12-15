import express from "express";

import paymentController from "../controllers/payment_controller";
const router = express.Router();

router.post("/init", paymentController.createTransaction);
router.post("/handle-Monri", paymentController.handleMonriCallback);
router.post("/handle-with-balance", paymentController.handlePaymentWithBalance);

export default router;
