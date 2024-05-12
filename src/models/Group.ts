import mongoose, { type ObjectId } from "mongoose";
const Schema = mongoose.Schema;

export interface IGroup {
  title: string;
  image: string;
  admin: ObjectId;
  post: ObjectId[];
  members: ObjectId[];
}

// Creamos el schema de un grupo
const groupSchema = new Schema<IGroup>(
  {
    title: {
      type: String,
      required: true,
      maxLength: [150, "El título del grupo no puede exceder de 150 caracteres."],
      trim: true,
    },
    image: [{
      type: String,
      required: false,
    }],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    post: [{
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: false
    }],
    members: [{
      type: {
        user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
        } 
      },
      required: false,
    }],
  },
  {
    timestamps: true,
  }
);

export const Group = mongoose.model<IGroup>("Group", groupSchema);
