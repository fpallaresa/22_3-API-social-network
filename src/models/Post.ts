import mongoose, { type ObjectId } from "mongoose";
const Schema = mongoose.Schema;

export interface IPost {
  text: string;
  images: string;
  user: ObjectId;
  likes: ObjectId[];
}

// Creamos el schema del post
const postSchema = new Schema<IPost>(
  {
    text: {
      type: String,
      required: true,
      maxLength: [450, "El post no puede exceder de 450 caracteres, revisa la publicación, por favor."],
      trim: true,
    },
    images: [{
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 100
    }],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    likes: [{
      type: {
        user: {
        type: Schema.Types.ObjectId,
        ref: "User"
        } 
      },
      required: false,
    }],
  },
  {
    timestamps: true,
  }
);

export const Post = mongoose.model<IPost>("Post", postSchema);
