import express from "express";
import { validate } from "../middlewares/validate_middleware";
import {
    contactFormGuestSchema,
} from "../models/validation_models/contact_fom_guest-schema";
import contactFormController from "../controllers/contact_form_controller";

const router = express.Router();

router.get("/", contactFormController.getAllQuestions);
router
    .route("/")
    .post(validate(contactFormGuestSchema), contactFormController.addContactFormQuestion);
router.put("/markAsResolved", contactFormController.markQuestionAsResolved);
router.put("/markAsUnresolved", contactFormController.markQuestionAsUnResolved);


export default router;
