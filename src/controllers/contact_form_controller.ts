import { Request, Response } from "express";

import { prisma } from "../server";
import contactFormHelper from "../helpers/contact_form_helper";

import { contactFormGuestSchemaCreateDto } from "../models/validation_models/contact_fom_guest-schema";


const addContactFormQuestion = async (req: Request, res: Response) => {
    const contactFormBody = req.body as contactFormGuestSchemaCreateDto;
    try {
        await prisma.contactMessage.create({
            data:
            {
                email: contactFormBody.email,
                question: contactFormBody.question,
                orderNumber: contactFormBody.orderNumber ?? null,
                device: contactFormBody.device ?? null,


            },
        });
        await contactFormHelper.sendEmailForContactForm(contactFormBody.email, contactFormBody.question, contactFormBody.device ?? null, contactFormBody.orderNumber ?? null,)
        res.status(201).json({
            success: true,
            message: "Created question",
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};

const getAllQuestions = async (req: Request, res: Response) => {

    try {
        const questions = await prisma.contactMessage.findMany(

        );

        res.status(200).json({
            success: true,
            data: questions,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};

const markQuestionAsResolved = async (req: Request, res: Response) => {
    try {
        await prisma.contactMessage.update({
            where: {
                id: req.body.contactFormId
            },
            data: {
                isResolved: true,
            },
        });
        res.status(200).json({
            success: true,
            message: "Resolved question",
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};
const markQuestionAsUnResolved = async (req: Request, res: Response) => {
    try {
        await prisma.contactMessage.update({
            where: {
                id: req.body.contactFormId
            },
            data: {
                isResolved: false,
            },
        });
        res.status(200).json({
            success: true,
            message: "Unresolved question",
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
        });
    }
};


export default {
    addContactFormQuestion,
    getAllQuestions,
    markQuestionAsResolved,
    markQuestionAsUnResolved

};
