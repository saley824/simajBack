import { Request, Response } from "express";
import { prisma } from "../server";
import globalCommonHelper from "../helpers/global_common_helper";

const getAllRegions = async (req: Request, res: Response) => {
    const searchText = req.query.searchText?.toString() || "";
    try {
        const regions = await prisma.region.findMany({
        });



        const filteredRegions: typeof regions = [];
        /// Searching based on name and keywords
        for (const region of regions) {
            //-------------------------searching regions by search text-------------------------
            if (region.name.toLowerCase().includes(searchText.toLowerCase())) {
                filteredRegions.push(region);
            }
            else {
                //--------------------------searching countries that are in that region by search text--------------------------
                const regionSupportedCountries = await prisma.regionSupportedCountry.findMany({
                    where: {
                        regionId: region.id
                    }
                });
                const countryIds = regionSupportedCountries.map((r) => r.countryId);
                const countries = await prisma.country.findMany({
                    where: {
                        id: {
                            in: countryIds,
                        }
                    }
                });

                for (const country of countries) {
                    if (country.name.toLowerCase().includes(searchText.toLowerCase())) {
                        filteredRegions.push(region);
                    }
                    else if (country.keywords != null) {
                        const searchLower = searchText.toLowerCase();
                        const keywords = country.keywords.split(",").map((keyword) => keyword.trim().toLowerCase());
                        const exists = keywords.some(item => item.toLowerCase().includes(searchLower));
                        if (exists) {
                            filteredRegions.push(region);
                        }
                    }
                }
            }
        }
        res.status(200).json({
            success: true,
            data: {
                regions: filteredRegions,

            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}





export default {
    getAllRegions
};
