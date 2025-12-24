import express from "express";
import { validate } from "../middlewares/validate_middleware";
import {
    userSchemaCreate,
    loginSchema,

} from "../models/validation_models/user-schema";
import {
    resetPasswordSchema

} from "../models/validation_models/reset-password-schema";
import {
    changePasswordSchema

} from "../models/validation_models/change-password-schema";
import authController from "../controllers/auth_controller";

const router = express.Router();


router.get("/users", authController.getAllUsers);



router.post("/signUp", validate(userSchemaCreate), authController.signUp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logOut", authController.logOut);
router.post("/verifyEmail", authController.verifyEmail);
router.post("/sendTokenForVerifyEmailAgain", authController.sendTokenForVerifyingAgain);




// PASSWORD HANDLER
router.patch("/resetPassword", validate(resetPasswordSchema), authController.resetPassword);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/changePassword", validate(changePasswordSchema), authController.changePassword);

export default router;
