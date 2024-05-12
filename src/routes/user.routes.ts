import express, {type NextFunction, type Response, type Request } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token";
import { getUserIdFromToken } from "../utils/utils";
const upload = multer({ dest: "public" });


// Modelos
import { User } from "../models/User";
import { Post } from "../models/Post";
import { FriendShipRequest } from "../models/FriendShipRequest";
import { isAuth } from "../middlewares/auth.middleware";

// Router propio de Usuarios
export const userRouter = express.Router();

// CRUD: READ - devuelve todos los usuarios (params opcionales http://localhost:3000/user?page=1&limit=10)
userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Asi leemos query params
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const user = await User.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Num total de elementos
    const totalElements = await User.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE - crea nuevo usuario
userRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const user = new User(req.body);
    const createdUser = await user.save();
    return res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
});

// NO CRUD - Busca usuario por nombre
userRouter.get("/name/:name", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  const name = req.params.name;

  try {
    const user = await User.find({ firstName: new RegExp("^" + name.toLowerCase(), "i") });

    if (user?.length) {
      res.json(user);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE - modifica usuario
userRouter.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const id = req.params.id;

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userToUpdate = await User.findById(id);
    if (userToUpdate) {
      Object.assign(userToUpdate, req.body);
      await userToUpdate.save();
      // Quitamos pass de la respuesta
      const userToSend: any = userToUpdate.toObject();
      delete userToSend.password;
      res.json(userToSend);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE - Elimina usuario
userRouter.delete("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const id = req.params.id;
    
    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userDeleted = await User.findByIdAndDelete(id);
    if (userDeleted) {
      res.json(userDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: READ - busca usuario por id
userRouter.get("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({});
    }

    const token: string | undefined = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado." });
    }

    const loggedUserId = getUserIdFromToken(token);

    if (!loggedUserId) {
      return res.status(401).json({ message: "Token inválido o expirado." });
    }

    const friendship = await FriendShipRequest.findOne({
      $or: [
        { sender: loggedUserId, recipient: id, status: "aceptado" }, 
        { sender: id, recipient: loggedUserId, status: "aceptado" } 
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: "No tienes permiso para acceder a este perfil." }); // El usuario no tiene permiso para acceder al perfil
    }

    const temporalUser = user.toObject();
    const includePosts = req.query.includePosts === "true";
    if (includePosts) {
      const posts = await Post.find({ user: id });
      temporalUser.post = posts;
    }

    res.json(temporalUser);
  } catch (error) {
    next(error);
  }
});

// LOGIN DE USUARIOS
userRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const email = req.body.email;
    // const password = req.body.password;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Se deben especificar los campos email y password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // return res.status(404).json({ error: "No existe un usuario con ese email" });
      // Por seguridad mejor no indicar qué usuarios no existen
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }

    // Comprueba la pass
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Quitamos password de la respuesta
      const userWithoutPass: any = user.toObject();
      delete userWithoutPass.password;

      // Generamos token JWT
      const jwtToken = generateToken(user._id.toString(), user.email);

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }
  } catch (error) {
    next(error);
  }
});
