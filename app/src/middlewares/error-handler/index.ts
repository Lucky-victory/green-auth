import { NextFunction, Request, Response } from "express";
import createError from "http-errors";

import { validationResult } from "express-validator";

export const validationErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
declare type WebError = Error & { status?: number };
export const errorHandler = (
  err: WebError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  //   // set locals, only providing error in development
  //   res.locals.message = err.message;
  //   res.locals.error = req.app.get("env") === "development" ? err : {};

  res
    .status(err.status || 500)
    .json({ errors: { title: err?.name, message: err?.message } });
};

export const errorNotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(createError(404));
};
