import express from "express";

import { config } from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";

import * as swaggerUi from "swagger-ui-express";

import { connectDB } from "./config/db";
import { swaggerDefinition } from "./docs/swagger";
import router from "./routes";
import { responseHandler } from "./middlewares";

const swaggerSpec = swaggerJSDoc(swaggerDefinition);

class App {
  public app: express.Application;
  private port: number;
  private environment: string;

  /**
   * @defenition - Initialize the app and set the port and environment
   */
  constructor() {
    config();
    this.port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    this.environment = process.env.NODE_ENV || "dev";

    this.app = express();

    connectDB();
    this.middlewares();
    this.routes();
  }

  /**
   * @defenition - Add the middlewares to the app to parse the request body and urlencoded data
   */
  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * @defenition - Add the routes to the app and set up the default route for the app
   */
  private routes(): void {
    // Add the router to the app
    this.app.use("/api/v1", router, responseHandler);

    // Add swagger docs route
    this.app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Default route for the app to show a welcome message
    this.app.get("/", (_: express.Request, res: express.Response) => {
      res.status(200).send("Welcome to the Quiz API 🚀");
    });

    // Add a ping route to check if the server is running
    this.app.get("/ping", (_: express.Request, res: express.Response) => {
      res.status(200).send("PONG 🏓");
    });

    // Fall back route for routes that don't exist
    this.app.use((_: express.Request, res: express.Response) => {
      res.status(404).send("Not Found");
    });
  }

  /**
   * @defenition - Start the server on the specified port and log the port and environment
   */
  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(
        `App is running on port ${this.port} ✅ in ${this.environment} environment 🚀`
      );
    });
  }
}

// Create a new instance of the app
const app = new App();

// Start the server
app.listen();
