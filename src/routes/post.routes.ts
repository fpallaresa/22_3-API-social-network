import express, { type NextFunction, type Response, type Request } from "express";

// Modelos
import { Post } from "../models/Post";

// Router propio de Posts
export const postRouter = express.Router();

// CRUD: READ - devuelve todos los Posts (params opcionales http://localhost:3000/post?page=1&limit=10)
postRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Estamos en el middleware /post que comprueba parámetros");

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page as any;
      req.query.limit = limit as any;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params page or limit are not valid" });
    }
  } catch (error) {
    next(error);
  }
});

postRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    // Asi leemos query params
    const page: number = req.query.page as any;
    const limit: number = req.query.limit as any;
    
    const post = await Post.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate(["user"]);

    // Num total de elementos
    const totalElements = await Post.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: post,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE - crea nuevo post
postRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const post = new Post(req.body);
    const createdPost = await post.save();
    return res.status(201).json(createdPost);
  } catch (error) {
    next(error);
  }
});

// NO CRUD - Busca post por titulo
postRouter.get("/title/:title", async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  const title = req.params.title;

  try {
    const post = await Post.find({ title: new RegExp("^" + title.toLowerCase(), "i") });

    if (post?.length) {
      res.json(post);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE - Elimina post
postRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const id = req.params.id;
    const postDeleted = await Post.findByIdAndDelete(id);
    if (postDeleted) {
      res.json(postDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE - modifica post
postRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const id = req.params.id;
    const postUpdated = await Post.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (postUpdated) {
      res.json(postUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: READ - busca post por id
postRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const id = req.params.id;
    const post = await Post.findById(id).populate(["user"]);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});
