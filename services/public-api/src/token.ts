import { NextFunction, Response, Request } from 'express';
import jwt from 'express-jwt';
import { tokenConfig } from './config';

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
function getTokenFromHeaderOrCookie(req: Request) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }

    if (req.cookies['token']) {
        return req.cookies['token'];
    }

    return null;
}

interface TokenPayload {
    /** Expiration date as unix timestamp. */
    exp: Number;

    /** Subject - user guid as UUID v4. */
    sub: string;
}

// Adds token to request
declare global {
    namespace Express {
        interface Request {
            token_payload?: TokenPayload
        }
    }
}

function invalidTokenHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send();
      return;
    }
    next(err);
}

function errorIfNoToken(req: Request, res: Response, next: NextFunction) {

    if (req.token_payload) {
        return next();
    }

    const error = { detail: 'Missing token' };
    res.status(401).json(error).send();
    return;
}

const jwtBaseOptions = {
    ...tokenConfig,
    requestProperty: 'token_payload',
    getToken: getTokenFromHeaderOrCookie
};

const requireToken = [
    jwt({
        ...jwtBaseOptions,
        credentialsRequired: true
    }),
    invalidTokenHandler,
    errorIfNoToken
];

const optionalToken = [
    jwt({
    ...jwtBaseOptions,
    credentialsRequired: false
    }),
    invalidTokenHandler
];

export { requireToken, optionalToken };
export type { TokenPayload };
