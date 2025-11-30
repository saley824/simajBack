import { Request, Response } from "express";
import { prisma } from "../server";




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
        res.status(500).json({
            success: false,
            message: "Internal Server Error"

        });
    }

}





export default {
    getAllDevices
};
