import express from "express";

import testController from "../controllers/testing_controller";
const router = express.Router();

router.post("/sendEmail", testController.testEmail);



export default router;
