import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";
import convertHelper from "../helpers/convert_helpers";
import currencyHelper from "../helpers/currency_helper";
import errorHelper from "../helpers/error_helper";





const topUpBalance = async (req: Request, res: Response) => {
    const { xBonCode, userId } = req.body;

    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                    id: userId
                }
            }
        );

        if (user == null) {
            return res.status(400).json({ success: false, message: "Something went wrong" });

        }
        if (xBonCode === "xBon") {
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    balance: user.balance.plus(10),
                },
            });

            if (updatedUser != null) {
                return res.status(200).json({ success: true, message: "Code applied successfully", });

            }
        }

        return res.status(400).json({ success: false, message: "Something went wrong" });



    } catch (error) {
        errorHelper.handle500(res, req);
    }

}
const getUserInfo = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const t = req.t;


    const currencyHeader = (req.headers["x-currency"] as string) ?? "BAM";
    const currency = currencyHelper.parseCurrency(currencyHeader)

    try {
        const user = await prisma.user.findUnique(
            {
                where: {
                    id: userId
                }
            }
        );

        const exchangeRate = await prisma.exchangeRate.findFirst(
            {
                where: {
                    currency: currency
                }
            }
        )

        if (user == null) {
            return res.status(400).json({ success: false, message: "Something went wrong" });

        }

        const balance = user.balance.toNumber() && exchangeRate ? Number((user.balance.toNumber() * exchangeRate!.rateFromBAM.toNumber()).toFixed(2)) : null;

        const userDto = convertHelper.getPublicUserDto(user, balance ?? 0)

        return res.status(200).json({
            success: true, data: {
                user: userDto
            }
        });






    } catch (error) {
        console.log(error)
        errorHelper.handle500(res, req);
    }

}



export default {
    topUpBalance,
    getUserInfo
};





