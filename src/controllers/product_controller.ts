import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";
import convertHelper from "../helpers/convert_helpers";
import currencyHelper from "../helpers/currency_helper";
import errorHelper from "../helpers/error_helper";
import { CountryDto } from "../models/dto_models/country_dto";
import { RegionDto } from "../models/dto_models/region_dto";





const getAllProductsForCountry = async (req: Request, res: Response) => {
    const countryId = req.query.countryId ? Number(req.query.countryId) : -1;
    const lang = req.headers["accept-language"] || "en";
    const currencyHeader = (req.headers["x-currency"] as string) ?? "BAM";
    const currency = currencyHelper.parseCurrency(currencyHeader)


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

        const exchangeRate = await prisma.exchangeRate.findFirst(
            {
                where: {
                    currency: currency
                }
            }
        )

        if (country != null) {
            for (var item of country.supportedRegions) {
                item.region.startsFrom = exchangeRate && item.region.startsFrom ? Number((exchangeRate!.rateFromBAM.toNumber() * item.region.startsFrom!).toFixed(2)) : null
            }
            const products = await prisma.product.findMany({
                where: {
                    OR: [
                        { countryId: countryId },

                    ]
                },
                orderBy: {
                    amount: "asc"
                }
            });


            const productsResponse = await Promise.all(
                products.map(product => productsHelper.formatProduct(product, currency))
            );

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
        console.log(error)
        errorHelper.handle500(res, req);

    }

}
const getAllProductsForRegion = async (req: Request, res: Response) => {
    const regionId = req.query.regionId ? Number(req.query.regionId) : -1;
    const lang = req.headers["accept-language"] || "en";
    const currencyHeader = (req.headers["x-currency"] as string) ?? "BAM";
    const currency = currencyHelper.parseCurrency(currencyHeader)


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

            const productsResponse = await Promise.all(
                products.map(product => productsHelper.formatProduct(product, currency))
            );

            const regionDto: RegionDto = {
                id: region.id,
                name: lang == "en" ? region.displayNameEn : region.displayNameSr,
                code: region.code,
                supportedCountries: region.supportedCountries.map(c => convertHelper.getCountryLightDto(c.country, lang)),
                keywords: region.keywords,
                startsFrom: region.startsFrom,

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
        console.log(error)
        errorHelper.handle500(res, req);

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
        console.log(error)
        errorHelper.handle500(res, req);

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
        console.log(error)
        errorHelper.handle500(res, req);

    }
}


export default {
    getAllProductsForCountry,
    getAllProductsForRegion,
    getProductById
};





