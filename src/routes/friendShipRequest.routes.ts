import express, {type NextFunction, type Response, type Request } from "express";
import { getUserIdFromToken } from "../utils/utils";

// Modelos
import { FriendShipRequest } from "../models/FriendShipRequest";
import { isAuth } from "../middlewares/auth.middleware";

// Router propio de Solictud de amistad
export const friendShipRequestRouter = express.Router();

// CRUD: READ - devuelve todas las solicitudes de amistad (params opcionales http://localhost:3000/friendship?page=1&limit=10)
friendShipRequestRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Asi leemos query params
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const friendShipRequest = await FriendShipRequest.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Num total de elementos
    const totalElements = await FriendShipRequest.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: friendShipRequest,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE - crea nueva solicitud de amistad
friendShipRequestRouter.post("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:3000");
  try {
    const { sender, recipient, message } = req.body;

    const existingRequest = await FriendShipRequest.findOne({ sender, recipient, message, status: "pendiente" });
    if (existingRequest) {
      return res.status(400).json({ message: "Ya existe una solicitud pendiente entre los usuarios con el mismo mensaje" });
    }

    const friendShipRequest = new FriendShipRequest({ sender, recipient, message, status: "pendiente" });
    const createdfriendShipRequest = await friendShipRequest.save();
    return res.status(201).json(createdfriendShipRequest);
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE - modifica solicitud de amistad
friendShipRequestRouter.put("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friendShipRequestId = req.params.id;

    if (!friendShipRequestId) {
      return res.status(400).json({ message: "ID de solicitud de amistad no válido" });
    }

    const { status } = req.body;

    if (!status || (status !== "aprobado" && status !== "rechazado")) {
      return res.status(400).json({ message: "Se requiere un nuevo estado válido (aprobado o rechazado)" });
    }

    const updatedFriendShipRequest = await FriendShipRequest.findByIdAndUpdate(
      friendShipRequestId,
      { status },
      { new: true }
    );

    if (!updatedFriendShipRequest) {
      return res.status(404).json({ message: "Solicitud de amistad no encontrada" });
    }

    res.json(updatedFriendShipRequest);
  } catch (error) {
    next(error);
  }
});

// CRUD: READ - busca solicitud de amistad por id de usuario
friendShipRequestRouter.get("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(404).json({});
    }

    const friendShipRequests = await FriendShipRequest.find({ $or: [{ sender: userId }, { recipient: userId }], status: "pendiente" });
    res.json(friendShipRequests);
  } catch (error) {
    next(error);
  }
});