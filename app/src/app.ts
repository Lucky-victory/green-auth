import express from "express";
import logger from "morgan";
import * as path from "path";
import passport from "./config/passport";
import {
  errorHandler,
  errorNotFoundHandler,
} from "./middlewares/error-handler";

// // Routes
import indexRoute from "./routes";
import authRoute from "./routes/auth";
import web3AuthRoute from "./routes/auth/web3";
import applicationRoute from "./routes/application";
export const app = express();

// Express configuration
app.set("port", process.env.PORT || 3800);

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

//routes
app.use("/", indexRoute);
app.use("/auth/web3", web3AuthRoute);
app.use("/auth", authRoute);
app.use("/applications", applicationRoute);

app.use(errorNotFoundHandler);
app.use(errorHandler);
