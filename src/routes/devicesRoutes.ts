import express from "express";

import devicesController from "../controllers/devices_controller";
const router = express.Router();

router.get("/", devicesController.getAllDevices);

export default router;
