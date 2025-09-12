import express from "express";

import regionController from "../controllers/region_controller";

const router = express.Router();

router.get("/", regionController.getAllRegions);







export default router;
