import express from "express";
import { validate } from "../middlewares/validate_middleware";
import {
    reviewSchemaCreate,
} from "../models/validation_models/review-schema";
import reviewController from "../controllers/review_controller";

const router = express.Router();

router.get("/", reviewController.getAllReviews);
router.get("/homeReviews", reviewController.getReviewsForHomeScreen);
router.get("/hasUserMadeReview", reviewController.hasUserMadeReview);
router
    .route("/makeReview")
    .post(validate(reviewSchemaCreate), reviewController.makeReview);

export default router;
