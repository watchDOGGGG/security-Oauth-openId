import express, { Application } from "express";
import { authRoute } from "./routes/auth";
import session from "express-session";
import passport from "./config/passport";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import path from "path";
import { clientRoute } from "./routes/client";

export const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI!,
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    },
  }),
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);
app.use("/client", clientRoute);
