import jwt from "jsonwebtoken";

export type UserRole = "user" | "admin";

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

export interface EmailVerificationPayload {
  email: string;
  purpose: "email_verification";
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

export function generateEmailVerificationToken(email: string): string {
  return jwt.sign({ email, purpose: "email_verification" }, getSecret(), {
    expiresIn: "10m",
    issuer: "primetrade-api",
    audience: "primetrade-clients",
  });
}

export function verifyEmailVerificationToken(token: string): EmailVerificationPayload {
  const decoded = jwt.verify(token, getSecret(), {
    issuer: "primetrade-api",
    audience: "primetrade-clients",
  }) as jwt.JwtPayload & Partial<EmailVerificationPayload>;
  if (!decoded.email || decoded.purpose !== "email_verification") {
    throw new jwt.JsonWebTokenError("Invalid verification token");
  }
  return { email: decoded.email, purpose: "email_verification" };
}
