import express from "express";
import cors from "cors";
import { postRouter } from "./routes/post.routes";
import { userRouter } from "./routes/user.routes";
import { friendShipRequestRouter } from "./routes/friendShipRequest.routes";
import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from "express";
import { connect } from "./db";

// Conexión a la BBDD
const main = async (): Promise<void> => {
  const database = await connect();

  // Configuración del server
  const PORT = 3000;
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );

  // Rutas
  const router = express.Router();
  router.get("/", (req: Request, res: Response) => {
    res.send(`Esta es la home de nuestra API ${database?.connection?.name as string} `);
  });
  router.get("*", (req: Request, res: Response) => {
    res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
  });

  // Middlewares de aplicación, por ejemplo middleware de logs en consola
  app.use((req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
    next();
  });

  // Acepta /user/*
  app.use("/user", (req: Request, res: Response, next: NextFunction) => {
    console.log("Me han pedido usuarios!!!");
    next();
  });

  // Acepta /post/*
  app.use("/post", (req: Request, res: Response, next: NextFunction) => {
    console.log("Me han pedido publicaciones!!!");
    next();
  });

    // Acepta /friendship/*
    app.use("/friendship", (req: Request, res: Response, next: NextFunction) => {
      console.log("Me han pedido solicitudes de amistad!!!");
      next();
    });

  // Usamos las rutas
  app.use("/post", postRouter);
  app.use("/user", userRouter);
  app.use("/friendship", friendShipRequestRouter);
  app.use("/public", express.static("public"));
  app.use("/", router);

  // Middleware de gestión de errores
  app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    console.log("*** INICIO DE ERROR ***");
    console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
    console.log(err);
    console.log("*** FIN DE ERROR ***");

    if (err?.name === "ValidationError") {
      res.status(400).json(err);
    } else {
      res.status(500).json(err);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server levantado en el puerto ${PORT}`);
  });
};
void main();
