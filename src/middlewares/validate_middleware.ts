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

                schema.validateSync(data, { abortEarly: false });

                // Ako želiš da prepišeš očišćene podatke:
                // req.body = data.body;
                // req.query = data.query;
                // req.params = data.params;

                return next();
            } catch (err) {
                const error = err as ValidationError;
                const errors = error.inner ?? [];

                const output = errors.map((e) => {
                    // e.message = "validation.username.required"
                    const translatedMessage = req.t
                        ? req.t(e.message)
                        : e.message;

                    return {
                        field: e.path
                            ? e.path.replace(/^body\.|^query\.|^params\./, "")
                            : null,
                        message: translatedMessage,
                    };
                });

                return res.status(400).json({
                    success: false,
                    type: "ValidationError",
                    message: output[0]?.message ?? "",
                    errors: output,
                });
            }
        };
