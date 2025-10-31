import { NextFunction, Request, Response } from "express";



const handleError = async (res: Response, message: string, statusCode: number, success: boolean) => {
  res.status(statusCode).json({
    success: success,
    message: "message",
  });;
};

const handle404 = async (res: Response,) => {

  res.status(404).json({
    success: false,
    message: "Error",
  });;
};
const handle500 = async (res: Response,) => {
  res.status(500).json({
    success: false,
    message: "Došlo je do greške na serveru. Molimo pokušajte ponovo kasnije.",

  });;
};



export default {
  handleError,
  handle404,
  handle500,

};