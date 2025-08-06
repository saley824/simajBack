import express from "express";
import { validate } from "../middlewares/validate_middleware";
import {
    userSchemaCreate,
    loginSchema,
} from "../models/validation_models/user-schema";
import authController from "../controllers/auth_controller";

const router = express.Router();


router.post("/signUp", validate(userSchemaCreate), authController.signUp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logOut", authController.logOut);




// PASSWORD HANDLER
router.patch("/resetPassword", authController.resetPassword);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/changePassword", authController.changePassword);

export default router;
