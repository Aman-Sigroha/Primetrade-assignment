import jwt from "jsonwebtoken";

export type UserRole = "user" | "admin";

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return secret;
}

export function generateToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, getSecret(), {
    expiresIn: "1d",
    issuer: "primetrade-api",
    audience: "primetrade-clients",
  });
}

export function verifyToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getSecret(), {
    issuer: "primetrade-api",
    audience: "primetrade-clients",
  }) as jwt.JwtPayload & AccessTokenPayload;
  if (!decoded.userId || !decoded.role) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }
  if (decoded.role !== "user" && decoded.role !== "admin") {
    throw new jwt.JsonWebTokenError("Invalid role");
  }
  return { userId: decoded.userId, role: decoded.role };
}
