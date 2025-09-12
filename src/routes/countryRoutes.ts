import express from "express";

import countryController from "../controllers/country_controller";

const router = express.Router();

router.get("/", countryController.getAllCountries);







export default router;
