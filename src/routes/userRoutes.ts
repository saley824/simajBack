import express from "express";

import userController from "../controllers/user_controller";
import { checkToken } from "../middlewares/auth_middleware";

const router = express.Router();
router.post("/topUpBalance", userController.topUpBalance);

router
    .route("/details/:id")
    .get(checkToken, userController.getUserInfo);

export default router;
