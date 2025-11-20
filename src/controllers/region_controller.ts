import { Request, Response } from "express";
import { prisma } from "../server";
import convertHelper from "../helpers/convert_helpers";
import { RegionDto } from "../models/dto_models/region_dto";

const getAllRegions = async (req: Request, res: Response) => {
    const searchText = req.query.searchText?.toString() || "";
    const lang = req.headers["accept-language"] || "en";
    try {
        const regions = await prisma.region.findMany({
            include: {
                supportedCountries: {
                    select: {
                        country: true
                    }
                },
            }
        });



        const filteredRegions: typeof regions = [];
        /// Searching based on name and keywords
        for (const region of regions) {
            //-------------------------searching regions by search text-------------------------
            if (region.displayNameEn.toLowerCase().includes(searchText.toLowerCase()) || region.displayNameSr.toLowerCase().includes(searchText.toLowerCase())) {
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
                    if (country.displayNameEn.toLowerCase().includes(searchText.toLowerCase()) || country.displayNameSr.toLowerCase().includes(searchText.toLowerCase())) {
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
        let localizedResult: RegionDto[] = [];

        filteredRegions.map(c => {
            localizedResult.push(
                {
                    id: c.id,
                    name: lang == "en" ? c.displayNameEn : c.displayNameSr,
                    code: c.code,
                    keywords: c.keywords,
                    supportedCountries: c.supportedCountries.map(c => convertHelper.getCountryLightDto(c.country, lang))

                }
            )

        });

        res.status(200).json({
            success: true,
            data: {
                regions: localizedResult,

            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}
//
const getSupportedCountriesForRegion = async (req: Request, res: Response) => {
    const regionId = req.params.regionId
        ? Number(req.params.regionId)
        : null; const lang = req.headers["accept-language"] || "en";
    try {
        if (regionId != null) {
            const regionSupportedCountries = await prisma.regionSupportedCountry.findMany({
                where: {
                    regionId: regionId
                }
            });

            const countryIds = regionSupportedCountries.map((r) => r.countryId);
            const supportedCountries = await prisma.country.findMany({
                where: {
                    id: {
                        in: countryIds,
                    }
                }
            });
            res.status(200).json({
                success: true,
                data: {
                    supportedCountries: supportedCountries.map(c => convertHelper.getCountryDto(c, lang))

                },
            });
        }

        else {
            res.status(400).json({
                success: false,
                message: "Region doesn't exist"

            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}




export default {
    getAllRegions,
    getSupportedCountriesForRegion,
};
