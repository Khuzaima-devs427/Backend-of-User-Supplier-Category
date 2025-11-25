import crypto from 'crypto';

/**
 * Generate a random token for email verification
 * @param length - Length of the token (default: 32)
 * @returns Random hexadecimal string
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a numeric verification code
 * @param length - Length of the code (default: 6)
 * @returns Random numeric string
 */
export const generateNumericCode = (length: number = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Generate a JWT-like token (if you need JWT functionality)
 * Note: For production, use a proper JWT library like 'jsonwebtoken'
 */
export const generateJWTToken = (payload: object, secret: string, expiresIn: string = '1h'): string => {
  // This is a simplified version. For production, use a proper JWT library.
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payloadEncoded = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
  })).toString('base64');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadEncoded}`)
    .digest('base64');
  
  return `${header}.${payloadEncoded}.${signature}`;
};

export default {
  generateToken,
  generateNumericCode,
  generateJWTToken
};