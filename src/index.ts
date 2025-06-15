import express from "express";
import bodyParser from "body-parser";
import router from "./routes/api";
import db from "./utils/database";
import docs from "./docs/route";
import cors from "cors";
import response from "./utils/response";
import errorMiddleware from "./middleware/error.middleware";

async function init() {
  try {
    const PORT = 3000;
    // Connect db dulu baru yg lain
    const result = await db();
    console.log(`Database status: ${result}`);

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());

    app.get("/", (req, res) => {
      response.success(res, "Hello World!", "Server is Running!!!!");
    });

    app.use("/api", router);
    docs(app);

    app.use(errorMiddleware.serverRoute());
    app.use(errorMiddleware.serverError());

    app.listen(PORT, () => {
      console.log(`Server is up and running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
