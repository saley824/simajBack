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
            process.env.FRONTEND_BASE_URL_LOCAL!

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



        const countries = await prisma.country.findMany({
            // orderBy: sort,
            // where: filterObject
        });

        let countryNames1 = countries.map(c => c.isoCode);
        let countryNames2 = countries.map(c => c.isoCode);


        let countriesThatIDontHave: string[] = [];
        let countriesThatTheyDontHave: string[] = [];


        let lastId = "";





        for (let index = 0; index < 14; index++) {
            console.log(index)
            const res = await axios.post(
                "https://api.esimfx.com/product/api/v1/get_products",
                {
                    "page_start": {
                        "id": lastId
                    },
                    "page_size": "99",
                    "countries": "",
                    "region": ""
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlbGxlcl9pZCI6Ijk3M2UwMWM0LWZhNjMtNGIzMS04NTc0LTU1YmMyZWI3ZDA0ZSIsInZlcnNpb24iOjEsImVwb2NoIjoxNzYyNjUwMTM4MTUyLCJjaGFubmVsX2lkIjoicmVzZWxsZXIiLCJpYXQiOjE3NjI2NTAxMzgsImV4cCI6MTc2MjY1MzczOH0.U1uAmvkTta4Mv_pKEr7zGJ2xUnn1C1rCkd3FZKqhnAU", // optional
                    }
                }
            );

            if (index != 13) {
                lastId = res.data.data.last_evaluated_key.id;

            }

            console.log(lastId)

            for (let index = 0; index < 99; index++) {
                try {
                    if (res.data.data.products[index].coverage.length == 1) {
                        const newCode = res.data.data.products[index].coverage[0]
                        if (countryNames1.includes(newCode)) {
                            countryNames1 = countryNames1.filter(item => item !== newCode);
                        }
                    }

                } catch (error) {

                }


            }

        }

        console.log(countriesThatIDontHave)


    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });


