import express from "express";

import regionController from "../controllers/region_controller";

const router = express.Router();

router.get("/", regionController.getAllRegions);
router.get("/supportedCountries/:regionId", regionController.getSupportedCountriesForRegion);


export default router;
