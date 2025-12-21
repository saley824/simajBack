import express from "express";

import transactionController from "../controllers/transaction_controller";
import { checkToken } from "../middlewares/auth_middleware";

const router = express.Router();



router
    .route("/")
    .get(checkToken, transactionController.getUserTransactions);
router
    .route("/esim")
    .get(checkToken, transactionController.getESimOrders);
// router.post("/create_new_transaction", transactionController.createNewTransaction);
// router.put("/add_coupon_code", transactionController.addCouponCode);
// router.get("/:id", transactionController.getTransactionById);

export default router;
