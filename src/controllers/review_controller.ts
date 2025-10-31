import { Request, Response } from "express";

import { prisma } from "../server";

import { reviewSchemaCreateDto } from "../models/validation_models/review-schema";


const makeReview = async (req: Request, res: Response) => {
    const reviewBody = req.body as reviewSchemaCreateDto;

    const user = await prisma.user.findUnique({
        where: {
            id: reviewBody.userId,

        },
        select: {
            name: true,
            lastName: true,
            username: true,

        }
    });



    if (user == null) {
        res.status(401).json({
            success: false,
            message: "There is no user with this uuid!",
        });
        return;
    }

    try {
        await prisma.review.create({
            data:
            {
                rating: reviewBody.rating,
                userId: reviewBody.userId,
                comment: reviewBody.comment ?? null,
                lastName: user.lastName,
                name: user.name
            },
        });
        res.status(200).json({
            success: true,
            data: reviewBody,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};

const getAllReviews = async (req: Request, res: Response) => {

    try {
        const reviews = await prisma.review.findMany(
            {
                select: {
                    name: true,
                    lastName: true,
                    rating: true,
                    comment: true,
                }
            }
        );

        res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};
const getReviewsForHomeScreen = async (req: Request, res: Response) => {

    try {
        const reviews = await prisma.review.findMany({
            where: {
                rating: 5,
                showOnHome: true,
            },
            select: {
                name: true,
                lastName: true,
                rating: true,
                comment: true,
            }
        });

        res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};

const hasUserMadeReview = async (req: Request, res: Response) => {
    const userId = req.body.userId;

    try {
        const review = await prisma.review.findFirst({
            where: {
                userId: userId,
            },
        });

        res.status(200).json({
            success: {
                hasUserMadeReview: review != null,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};

export default {
    makeReview,
    getAllReviews,
    hasUserMadeReview,
    getReviewsForHomeScreen,
};
