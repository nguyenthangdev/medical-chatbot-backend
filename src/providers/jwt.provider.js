// src/providers/jwt.provider.js
import jwt from 'jsonwebtoken';

export const JWTProvider = {
  generateToken: (payload, secretSignature, tokenLife) => {
    return jwt.sign(payload, secretSignature, { expiresIn: tokenLife });
  },
  verifyToken: (token, secretSignature) => {
    return jwt.verify(token, secretSignature);
  }
};