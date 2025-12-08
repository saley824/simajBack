import { Request, Response } from "express";
import { prisma } from "../server";
import globalCommonHelper from "../helpers/global_common_helper";
import { CountryDto } from "../models/dto_models/country_dto";
import { RegionDto } from "../models/dto_models/region_dto";
import convertHelper from "../helpers/convert_helpers";
import currencyHelper from "../helpers/currency_helper";
import { getAccessToken } from "../helpers/token_helper";









const getAllCountries = async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const perPage = req.query.perPage ? Number(req.query.perPage) : 10;
    const searchText = req.query.searchText?.toString() || "";

    const lang = req.headers["accept-language"] || "en";

    const currencyHeader = (req.headers["x-currency"] as string) ?? "BAM";
    const currency = currencyHelper.parseCurrency(currencyHeader)



    try {
        const countries = await prisma.country.findMany({
            orderBy: {
                priority: 'asc'
            },
            include: {
                supportedRegions: true
            }
        });

        const exchangeRate = await prisma.exchangeRate.findFirst(
            {
                where: {
                    currency: currency
                }
            }
        )
        const filteredCountries: typeof countries = [];

        /// Searching based on name and keywords
        for (const country of countries) {
            if (country.displayNameEn.toLowerCase().includes(searchText.toLowerCase()) || country.displayNameSr.toLowerCase().includes(searchText.toLowerCase())) {
                filteredCountries.push(country);
            }
            else if (country.keywords != null) {
                const searchLower = searchText.toLowerCase();
                const keywords = country.keywords.split(",").map((keyword) => keyword.trim().toLowerCase());
                const exists = keywords.some(item => item.toLowerCase().includes(searchLower));
                if (exists) {
                    filteredCountries.push(country);
                }
            }
        }
        // PAGINATION
        const skip = (page - 1) * perPage;
        const take = perPage + 1;
        const result = filteredCountries.slice(skip, skip + take);
        let hasNext: boolean = result.length > perPage;


        let localizedResult: CountryDto[] = [];

        result.map(c => {
            localizedResult.push(
                {
                    id: c.id,
                    name: lang == "en" ? c.displayNameEn : c.displayNameSr,
                    isoCode: c.isoCode,
                    mcc: c.mcc,
                    keywords: c.keywords,
                    supportedRegions: [],
                    startsFrom: c.startsFrom && exchangeRate ? Number((c.startsFrom * exchangeRate!.rateFromBAM.toNumber()).toFixed(2)) : null
                }
            )

        });


        res.status(200).json({
            success: true,
            data: {
                countries: localizedResult,
                hasNext: hasNext
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}

const getSupportedRegionsForCountry = async (req: Request, res: Response) => {
    const countryId = req.params.regionId
        ? Number(req.params.regionId)
        : null;
    const lang = req.headers["accept-language"] || "en";
    const currencyHeader = (req.headers["x-currency"] as string) ?? "BAM";
    const currency = currencyHelper.parseCurrency(currencyHeader)
    try {
        if (countryId != null) {
            const regionSupportedCountries = await prisma.regionSupportedCountry.findMany({
                where: {
                    countryId: countryId
                }
            });

            const exchangeRate = await prisma.exchangeRate.findFirst(
                {
                    where: {
                        currency: currency
                    }
                }
            )

            const regionIds = regionSupportedCountries.map((r) => r.regionId);
            const supportedRegions = await prisma.region.findMany({
                where: {
                    id: {
                        in: regionIds,

                    },



                },
                include: {
                    supportedCountries: {
                        select: {
                            country: true
                        }
                    },
                }
            });

            let localizedResult: RegionDto[] = [];



            supportedRegions.map(c => {
                localizedResult.push(
                    {
                        id: c.id,
                        name: lang == "en" ? c.displayNameEn : c.displayNameSr,
                        code: c.code,
                        keywords: c.keywords,
                        startsFrom: c.startsFrom && exchangeRate ? Number((c.startsFrom * exchangeRate!.rateFromBAM.toNumber()).toFixed(2)) : null,

                        supportedCountries: c.supportedCountries.map(c => convertHelper.getCountryDto(c.country, lang),
                        )

                    }
                )

            });
            res.status(200).json({
                success: true,
                data: {
                    regions: localizedResult,

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
    getAllCountries,
    getSupportedRegionsForCountry
};
