import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";
import convertHelper from "../helpers/convert_helpers";
import { CountryDto } from "../models/dto_models/country_dto";
import { RegionDto } from "../models/dto_models/region_dto";





const getAllProductsForCountry = async (req: Request, res: Response) => {
    const countryId = req.query.countryId ? Number(req.query.countryId) : -1;
    const lang = req.headers["accept-language"] || "en";


    try {
        const country = await prisma.country.findUnique({
            where: {
                id: countryId
            },
            include: {
                supportedRegions: {
                    select: {
                        region: true
                    }
                },
            }
        });
        if (country != null) {
            const products = await prisma.product.findMany({
                where: {
                    OR: [
                        { countryId: countryId },
                        // { regionId: regionId }
                    ]
                },
                orderBy: {
                    amount: "asc"
                }
            });

            const productsResponse = products.map(productsHelper.formatProduct);
            let localizedCountry: CountryDto = convertHelper.getCountryDto(country, lang)



            res.status(200).json({
                success: true,
                data: {
                    country: localizedCountry,
                    products: productsResponse,

                },
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}
const getAllProductsForRegion = async (req: Request, res: Response) => {
    const regionId = req.query.regionId ? Number(req.query.regionId) : -1;
    const lang = req.headers["accept-language"] || "en";

    try {
        const region = await prisma.region.findFirst({
            where: {
                id: regionId,
            },
            include: {
                supportedCountries: {
                    select: {
                        country: true
                    }
                },
            }
        });
        if (region != null) {
            const products = await prisma.product.findMany({
                where: {
                    OR: [
                        { regionId: regionId },
                    ]
                },
                orderBy: {
                    amount: "asc"
                }
            });

            const productsResponse = products.map(productsHelper.formatProduct);

            const regionDto: RegionDto = {
                id: region.id,
                name: lang == "en" ? region.displayNameEn : region.displayNameSr,
                code: region.code,
                supportedCountries: region.supportedCountries.map(c => convertHelper.getCountryDto(c.country, lang))

            }
            res.status(200).json({
                success: true,
                data: {
                    region: regionDto,
                    products: productsResponse,

                },
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}
const getProductById = async (req: Request, res: Response) => {
    const productId = req.params.id;
    try {
        const product = await prisma.product.findFirst({
            where: {
                id: productId
            },

        });
        res.status(200).json({
            success: true,
            data: {
                product: product,

            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}
const getCouponCode = async (req: Request, res: Response) => {
    const productId = req.params.id;
    try {
        const product = await prisma.product.findFirst({
            where: {
                id: productId
            },

        });
        res.status(200).json({
            success: true,
            data: {
                product: product,

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
    getAllProductsForCountry,
    getAllProductsForRegion,
    getProductById
};





