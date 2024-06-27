import { Router } from "express";
import { AuthHandler } from "../../handlers/auth";
// import { loginValidator, registerValidator } from "../../middlewares/validator";
import { validationErrorHandler } from "../../middlewares/error-handler";

const router = Router();

router.post(
  "/register",
  //   registerValidator,
  // validationErrorHandler,
  AuthHandler.register
);

router.post(
  "/login",
  //   loginValidator,
  // validationErrorHandler,
  AuthHandler.login
);

router.get("/google", AuthHandler.googleLogin);

router.get("/google/callback", AuthHandler.googleCallback);
export default router;
