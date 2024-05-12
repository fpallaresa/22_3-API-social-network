import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const generateRandom = (min: number = 0, max: number = 100): number => {
  const difference: number = max - min;
  let rand: number = Math.random();
  rand = Math.floor(rand * difference);
  rand = rand + min;

  return rand;
};

export {
  generateRandom,
};

interface DecodedToken extends JwtPayload {
  userId: string;
}

// Función para obtener el ID del usuario a partir del token
export function getUserIdFromToken(token: string): string | null {
  try {
    const secret: Secret = process.env.JWT_SECRET || '';
    const decodedToken = jwt.verify(token, secret) as unknown;

    if (typeof decodedToken === 'object' && decodedToken !== null && 'userId' in decodedToken) {
      const userId = (decodedToken as DecodedToken).userId;
      return userId;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}