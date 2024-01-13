import express, { Application } from "express";
import path from "path";
const cors = require("cors");
import { UserRoute, LoginRoute } from "../routes";

var xhub = require("express-x-hub");

async function App(app: Application) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.json());

  app.use(cors());

  const imagePath = path.join(__dirname, "../images");

  app.use("/images", express.static(imagePath));
  app.use("/user", UserRoute);
  app.use("/login", LoginRoute);

  return app;
}

module.exports = {
  App,
};
