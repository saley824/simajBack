import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";




const getAllProductsForCountry = async (req: Request, res: Response) => {
    const countryId = req.query.countryId ? Number(req.query.countryId) : -1;
    const regionId = req.query.regionId ? Number(req.query.regionId) : -1;



    try {
        const country = await prisma.country.findFirst({
            where: {
                id: countryId
            }
        });
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

        res.status(200).json({
            success: true,
            data: {
                country: country,
                products: productsResponse,

            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}
const getProductById = async (req: Request, res: Response) => {
    const productId = req.params.id ? Number(req.params.id) : -1;
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
    const productId = req.params.id ? Number(req.params.id) : -1;
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
    getAllProducts: getAllProductsForCountry,
    getProductById
};





