import express from "express";

import transactionController from "../controllers/transaction_controller";

const router = express.Router();

router.get("/user", transactionController.getUserTransactions);
// router.post("/create_new_transaction", transactionController.createNewTransaction);
// router.put("/add_coupon_code", transactionController.addCouponCode);
// router.get("/:id", transactionController.getTransactionById);

export default router;
