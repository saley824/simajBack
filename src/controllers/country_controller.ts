import { Request, Response } from "express";
import { prisma } from "../server";
import globalCommonHelper from "../helpers/global_common_helper";
import { CountryDto } from "../models/dto_models/country_dto";








const getAllCountries = async (req: Request, res: Response) => {

    const page = req.query.page ? Number(req.query.page) : 1;
    const perPage = req.query.perPage ? Number(req.query.perPage) : 10;
    const searchText = req.query.searchText?.toString() || "";

    const lang = req.headers["accept-language"] || "en";





    try {
        const countries = await prisma.country.findMany({
            orderBy: {
                priority: 'asc'
            },
        });
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
                    mcc: c.mcc

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





export default {
    getAllCountries
};
