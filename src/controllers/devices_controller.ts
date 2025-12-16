import { Request, Response } from "express";
import { prisma } from "../server";
import errorHelper from "../helpers/error_helper";




const getAllDevices = async (req: Request, res: Response) => {
    const lang = req.headers["accept-language"] || "en";
    try {
        const devices = await prisma.compatibleDevice.findMany(
            {
                include: {
                    brand: true
                }
            }
        );

        res.status(200).json({
            success: true,
            data: {
                devices: devices,


            },
        });
    } catch (error) {
        errorHelper.handle500(res, req);
    }

}





export default {
    getAllDevices
};
