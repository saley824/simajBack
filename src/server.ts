import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

import axios from "axios";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import countryRouter from "./routes/countryRoutes";
import regionRouter from "./routes/regionRoutes";
import productRouter from "./routes/product_routes";
import transactionRouter from "./routes/transaction_router";
import reviewsRouter from "./routes/reviewRoutes";
import contactFormRouter from "./routes/contactFormRoutes";
import userRouter from "./routes/userRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import deviceRoutes from "./routes/devicesRoutes";
import { date } from "yup";







// import dotenv from "dotenv";
// dotenv.config();
// import PostRouter from "./routes/blog.route";

// export const prisma = new PrismaClient().$extends({
//   result: {
//     product: {
//       discountedPrice: {
//         needs: { price: true },
//         compute(product) {
//           return product.price * 0.7;
//         },
//       },
//     },
//   },
// });

export const prisma = new PrismaClient();


// var serviceAccount = require("./serviceAccountKeyNotifications.json");

// export const firebase = admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: "gs://grad-push-notifications-2a76a.appspot.com", //storage bucket url
// });

// export const bucket = firebase.storage().bucket()

// import app from "./app";
const app = express();


async function main() {

    app.use(cors({
        origin: [
            process.env.FRONTEND_BASE_URL!,
            process.env.FRONTEND_BASE_URL_LOCAL!,
            process.env.FRONTEND_BASE_URL_PRODUCTION!

        ],

        methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed HTTP methods
        credentials: true // if you need cookies/auth
    }));
    app.use(express.json());

    // Register API routes

    const baseUrl: string = "/api/v1";


    app.use(`${baseUrl}/auth`, authRouter);
    app.use(`${baseUrl}/countries`, countryRouter);
    app.use(`${baseUrl}/regions`, regionRouter);
    app.use(`${baseUrl}/products`, productRouter);
    app.use(`${baseUrl}/transactions`, transactionRouter);
    app.use(`${baseUrl}/reviews`, reviewsRouter);
    app.use(`${baseUrl}/contactForm`, contactFormRouter);
    app.use(`${baseUrl}/user`, userRouter);
    app.use(`${baseUrl}/checkout`, checkoutRoutes);
    app.use(`${baseUrl}/devices`, deviceRoutes);


    /// this make problem, check it out
    // app.all("*", (req: Request, res: Response) => {
    //     res.status(404).json({ error: `Route ${req.originalUrl} not found` });
    // });

    const port = Number(process.env.PORT) || 8080;

    app.listen(port, "0.0.0.0", () => {
        console.log(`✅ Server is listening on port ${port}`);
    });
}

main()
    .then(async () => {
        await prisma.$connect();

        // const countries = await prisma.country.findMany({
        //     // orderBy: sort,
        //     // where: filterObject
        // });

        // let countryNames1 = countries.map(c => c.isoCode);
        // let countryNames2 = countries.map(c => c.isoCode);


        // let countriesThatIDontHave: string[] = [];
        // let countriesThatTheyDontHave: string[] = [];


        // let lastId = "";


        // for (let index = 0; index < 14; index++) {
        //     console.log(index)
        //     const res = await axios.post(
        //         "https://api.esimfx.com/product/api/v1/get_products",
        //         {
        //             "page_start": {
        //                 "id": lastId
        //             },
        //             "page_size": "99",
        //             "countries": "",
        //             "region": ""
        //         },
        //         {
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlbGxlcl9pZCI6Ijk3M2UwMWM0LWZhNjMtNGIzMS04NTc0LTU1YmMyZWI3ZDA0ZSIsInZlcnNpb24iOjEsImVwb2NoIjoxNzYyODYwMjk0NDk4LCJjaGFubmVsX2lkIjoicmVzZWxsZXIiLCJpYXQiOjE3NjI4NjAyOTQsImV4cCI6MTc2Mjg2Mzg5NH0.w73xdGNRKn15f-UEaPWlHJbWiu_LkzMYD5MzOUoscn4", // optional
        //             }
        //         }
        //     );

        //     if (index != 13) {
        //         lastId = res.data.data.last_evaluated_key.id;

        //     }

        //     console.log(lastId)

        //     for (let index = 0; index < 99; index++) {
        //         try {
        //             const product = res.data.data.products[index]
        //             const coverage = product.coverage
        //             if (coverage.length > 1) {
        //                 const newCode = product.region
        //                 const region = await prisma.region.findFirst({
        //                     where: {
        //                         code: newCode
        //                     }
        //                 });

        //                 for (let j = 0; j < coverage.length; j++) {
        //                     const country = await prisma.country.findFirst({
        //                         where: {
        //                             isoCode: coverage[j]
        //                         }
        //                     });
        //                     if (country != null && region != null) {
        //                         console.log(country.displayNameEn)
        //                         console.log(region.displayNameEn)
        //                         try {
        //                             await prisma.regionSupportedCountry.create({
        //                                 data: {
        //                                     countryId: country!.id,
        //                                     regionId: region!.id,
        //                                 }
        //                             });
        //                         } catch (error) {
        //                             console.log("exist")
        //                         }

        //                     }

        //                 }
        //             }

        //         } catch (error) {
        //             console.log(error)
        //         }


        //     }

        // }

    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });


