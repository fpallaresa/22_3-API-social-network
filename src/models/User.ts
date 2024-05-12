import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { IPost } from "./Post";
const Schema = mongoose.Schema;

const allowedGender = ["MUJER", "HOMBRE", "PERSONALIZADO"];
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const getMinimumAgeDate = () => {
  const today = new Date();
  return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
};

const validateMinimumAge = (value: Date) => {
  const minimumAgeDate = getMinimumAgeDate();
  return value <= minimumAgeDate;
};

export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthdayDate: Date;
  gender: string;
  profileImage: string;
  friends?: IUser[];
  post?: IPost[];
}

// Creamos el schema del usuario
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator: (text: string) => validator.isEmail(text),
        message: "Email incorrecto",
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: (text: string) => passwordRegex.test(text),
        message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial",
      },
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      minLength: [2, "El nombre  debe tener al menos 2 caracteres"],
      maxLength: [20, "El nombre no puede contener más de 20 caracteres"],
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: [2, "El apellido  debe tener al menos 2 caracteres"],
      maxLength: [20, "El apellido no puede contener más de 20 caracteres"],
      trim: true,
    },
    birthdayDate: {
      type: Date,
      required: true,
      validate: {
        validator: validateMinimumAge,
        message: "Debes tener al menos 16 años",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: allowedGender,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    // Si la contraseña ya estaba encriptada, no la encriptamos de nuevo
    if (this.isModified("password")) {
      const saltRounds = 10;
      const passwordEncrypted = await bcrypt.hash(this.password, saltRounds);
      this.password = passwordEncrypted;
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
