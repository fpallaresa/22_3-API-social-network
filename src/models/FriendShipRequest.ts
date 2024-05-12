import mongoose, { type ObjectId } from "mongoose";
const Schema = mongoose.Schema;

const statusRelationship = ["pendiente", "aceptado", "rechazado"];

export interface IFriendShipRequest {
  sender: ObjectId;
  recipient: ObjectId;
  message: string;
  status: string;
}

// Creamos el schema de la relación
const friendShipRequestSchema = new Schema<IFriendShipRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxLength: [450, "El mensaje no puede exceder de 450 caracteres, revisalo antes de enviar la solicitud, por favor."],
      required: false,
    },
    status: {
      type: String,
      enum: statusRelationship,
      default: "pendiente",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export const FriendShipRequest = mongoose.model<IFriendShipRequest>("friendShipRequest", friendShipRequestSchema);
