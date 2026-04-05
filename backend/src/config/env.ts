export const env = {
  port: Number(process.env.PORT) || 3001,
};

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return "dev-insecure-jwt-secret-shopeefake";
}
