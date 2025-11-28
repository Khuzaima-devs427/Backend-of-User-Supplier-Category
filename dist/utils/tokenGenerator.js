"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWTToken = exports.generateNumericCode = exports.generateToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a random token for email verification
 * @param length - Length of the token (default: 32)
 * @returns Random hexadecimal string
 */
const generateToken = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateToken = generateToken;
/**
 * Generate a numeric verification code
 * @param length - Length of the code (default: 6)
 * @returns Random numeric string
 */
const generateNumericCode = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
};
exports.generateNumericCode = generateNumericCode;
/**
 * Generate a JWT-like token (if you need JWT functionality)
 * Note: For production, use a proper JWT library like 'jsonwebtoken'
 */
const generateJWTToken = (payload, secret, expiresIn = '1h') => {
    // This is a simplified version. For production, use a proper JWT library.
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadEncoded = Buffer.from(JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
    })).toString('base64');
    const signature = crypto_1.default
        .createHmac('sha256', secret)
        .update(`${header}.${payloadEncoded}`)
        .digest('base64');
    return `${header}.${payloadEncoded}.${signature}`;
};
exports.generateJWTToken = generateJWTToken;
exports.default = {
    generateToken: exports.generateToken,
    generateNumericCode: exports.generateNumericCode,
    generateJWTToken: exports.generateJWTToken
};
