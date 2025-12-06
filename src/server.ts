import { PrismaClient } from "@prisma/client";
import express from "express";

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
import paymentRoutes from "./routes/payment_route";
import testRoutes from "./routes/testRoutes";
import testHelper from "./helpers/user_helper";
import axios from "axios";
import { getAccessToken } from "./helpers/token_helper";







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

        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // allowed HTTP methods
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
    app.use(`${baseUrl}/payment`, paymentRoutes);
    app.use(`${baseUrl}/test`, testRoutes);


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

        const token = await getAccessToken();
        testHelper.sendEmailForResetPassword()


        // const products = await prisma.product.findMany({
        //     where: {
        //         amount: 50
        //     }
        // });
        // var i = 0;
        // for (const product of products) {
        //     if (product.countryId && product.sellingPrice && product.countryId) {

        //         i++;

        //         const startsFrom = Number((product.sellingPrice / 50).toFixed(2))
        //         // try {
        //         //     await prisma.country.update({
        //         //         where: { id: product.countryId },
        //         //         data: {
        //         //             startsFrom:
        //         //                 startsFrom,
        //         //         },
        //         //     });
        //         // } catch (error) {
        //         //     console.log(error)
        //         // }
        //     }

        // }
        // console.log(i)


        // console.log("ssssss")


        // await prisma.product.createMany({
        //     data: products
        // });


        // const countries = await prisma.country.findMany({
        //     // orderBy: sort,
        //     // where: filterObject
        // });

        // let countryNames1 = countries.map(c => c.isoCode);
        // let countryNames2 = countries.map(c => c.isoCode);


        // let countriesThatIDontHave: string[] = [];
        // let countriesThatTheyDontHave: string[] = [];


        let lastId = "";

        // await prisma.product.deleteMany(

        // )

        // for (let index = 0; index < 25; index++) {
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
        //                 "Authorization": `Bearer ${token}`,
        //             }
        //         }
        //     );

        //     if (index != 13) {
        //         lastId = res.data.data.last_evaluated_key.id;

        //     }



        //     for (let index = 0; index < 99; index++) {

        //         try {
        //             const product = res.data.data.products[index]

        //             if (product.is_unlimited) {
        //                 console.log(product)
        //             }

        //             const networks = product.networks
        // if (product.coverage.length == 1) {
        //     const newCode = product.coverage[0]
        //     const country = await prisma.country.findFirst({
        //         where: {
        //             isoCode: newCode
        //         }
        //     });
        //     await prisma.product.create(
        //         {
        //             data: {
        //                 id: product.id,
        //                 name: product.name,
        //                 duration: product.duration,
        //                 durationUnit: product.duration_unit,
        //                 amount: product.amount,
        //                 amountUnit: product.amount_unit,
        //                 imsiProfile: product.imsi_profile,
        //                 countryId: country?.id,
        //                 originalPrice: product.price,
        //                 sellingPrice: product.price,
        //                 isUnlimited: product.is_unlimited,
        //                 highSpeed: product.high_speed,
        //                 highSpeedUnit: product.high_speed_unit,
        //                 unlimitedSpeed: product.unlimited_speed,
        //             }
        //         }
        //     )

        //     for (let j = 0; j < networks.length; j++) {
        //         await prisma.network.create({
        //             data: {
        //                 mccmnc: networks[j].mccmnc,
        //                 name: networks[j].name,
        //                 speed: networks[j].speed,
        //                 country_iso: networks[j].country_iso,
        //                 productId: product.id,
        //             }
        //         });
        //     }
        // }

        // } catch (error) {
        //     console.log(error)
        // }


        //         }

        //     }

    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });


