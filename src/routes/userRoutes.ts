import express from "express";

import userController from "../controllers/user_controller";

const router = express.Router();
router.post("/topUpBalance", userController.topUpBalance);

export default router;
