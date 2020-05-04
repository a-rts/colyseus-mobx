import commander from "commander";
import path from "path";

import http from "http";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
// import socialRoutes from "@colyseus/social/express"

import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import configure from "./webpack.config";

import Game from "./server/game";

commander
  .option("--env <env>", "Set the environment to dev or prod")
  .parse(process.argv);
const isDev = commander.env === "dev";

const port = Number(process.env.PORT || 3000);
const app = express();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/matchmake/", apiLimiter);
app.set("trust proxy", 1);

if (isDev) {
  const config = configure("dev");
  const compiler = webpack(config);

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
      logLevel: "warn",
    })
  );
}

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// Register Colyseus room handlers.
gameServer.define("game", Game);

/**
 * Register @colyseus/social routes
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// Register colyseus monitor AFTER registering room handlers.
app.use("/colyseus", monitor());

if (!isDev) {
  app.use(express.static(__dirname + "/client/build"));
  app.get("/", function (req, res) {
    res.sendFile(__dirname + "/client/build/index.html");
  });
}

gameServer.listen(port);
console.log(`Listening on ${port}`);
