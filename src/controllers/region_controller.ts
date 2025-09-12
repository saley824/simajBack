import { Request, Response } from "express";
import { prisma } from "../../server";
import globalCommonHelper from "../helpers/global_common_helper";

const getAllRegions = async (req: Request, res: Response) => {
    const searchText = req.query.searchText?.toString() || "";
    try {
        const regions = await prisma.region.findMany({
        });

        const filteredRegions: typeof regions = [];
        /// Searching based on name and keywords
        for (const region of regions) {
            if (region.name.toLowerCase().includes(searchText.toLowerCase())) {
                filteredRegions.push(region);
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
