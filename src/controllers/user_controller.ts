import { NextFunction, Request, Response } from "express";

import { prisma } from "../server";

import productsHelper from "../helpers/product_helper";





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
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}



export default {
    topUpBalance
};





