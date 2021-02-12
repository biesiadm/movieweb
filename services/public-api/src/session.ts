import { NextFunction, Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { HTTPValidationError } from './api/users';
import { tokenConfig } from './config';

interface TokenPayload {
    /** Expiration date as unix timestamp. */
    exp: Number;

    /** Subject - user guid as UUID v4. */
    sub: string;
}

declare module 'express-session' {
    interface SessionData {
        token_payload?: TokenPayload
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LogInCredentials:
 *       type: "object"
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 */
function requireLogInCredentials(req: Request, res: Response, next: NextFunction) {

    const email = req.body?.username;
    const password = req.body?.password;
    if (!email || !password) {
        const error: HTTPValidationError = {
            detail: [
                {
                    loc: ["body"],
                    msg: "Missing required parameters.",
                    type: "parameter"
                }
            ]
        };
        res.status(422).json(error);
        return next(error);
    }

    next();
}

function handleTokenExpiration(req: Request, res: Response, next: NextFunction) {

    // Skip if no token
    if (!req.session?.token_payload) {
        return next();
    }

    const token: TokenPayload = req.session.token_payload;

    // TODO(kantoniak): Handle token refreshing

    // Remove payload if token expired
    if (token.exp < new Date().getTime()/1000) {
        delete req.session.token_payload;
        return next();
    }

    return next();
}

// Adds token to request
declare global {
    namespace Express {
        interface Request {
            token_payload?: TokenPayload
        }
    }
}

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     JwtBearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     JwtCookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */
function requireSessionOrToken(req: Request, res: Response, next: NextFunction) {

    // Extract bearer token if exists
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const payload: TokenPayload = <any>jwt.verify(token, tokenConfig.secret, tokenConfig.options);
            req.token_payload = payload;
            return next();
        } catch(err) {
            const error = { detail: 'Invalid token' };
            res.status(401).json(error).send();
            return;
        }
    }

    // Use session token
    if (req.session?.token_payload) {
        // HandleTokenExpiration checked everything already
        const token: TokenPayload = req.session.token_payload;
        req.token_payload = token;
        return next();
    }

    const error = { detail: 'Missing token' };
    res.status(401).json(error).send();
    return;
}


export { requireLogInCredentials, handleTokenExpiration, requireSessionOrToken };
export type { TokenPayload };
