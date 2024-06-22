import express from "express";
import logger from "morgan";
import * as path from "path";
import passport from "passport";
import {
  errorHandler,
  errorNotFoundHandler,
} from "./middlewares/error-handler";

// // Routes
import indexRoute from "./routes";
// import linkRoute from "./routes/link";
// import apiKeyRoute from "./routes/api-key";
// import authRoute from "./routes/auth";

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
// app.use("/link", linkRoute);
// app.use("/api-key", apiKeyRoute);
// app.use("/auth", authRoute);

app.use(errorNotFoundHandler);
app.use(errorHandler);
