/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";
import { ObjectSchema, ValidationError } from "yup";

export const validate =
    (schema: ObjectSchema<any>): RequestHandler =>
        (req, res, next) => {
            try {
                const data = schema.cast(
                    {
                        body: req.body,
                        query: req.query,
                        params: req.params,
                    },
                    { stripUnknown: true }
                );

                schema.validateSync(data, { abortEarly: false, });


                // req.body = data.body;
                // req.query = data.query;

                // schema.validateSync(data, { abortEarly: true,  });
                return next();
            } catch (err) {
                // console.log(err)
                const error = err as ValidationError;
                const errors = error.inner as ValidationError[];

                const outPut = errors.map((error) => {
                    return {
                        field: error.path?.split(".")[1],
                        message: error.message.startsWith("body.") ? error.message.substring(5).toLocaleUpperCase() : error.message,
                    };
                })
                console.log(errors)
                return res.status(400).json({
                    success: false,
                    message: outPut[0]?.message ?? "",
                    type: "ValidationError",
                    errors: outPut

                });
            }
        };
