import { NextFunction, Response, Request } from 'express';
import jwt from 'express-jwt';
import { tokenConfig } from './config';

interface TokenPayload {
    /** Expiration date as unix timestamp. */
    exp: Number;

    /** Subject - user guid as UUID v4. */
    sub: string;
}

// TODO(kantoniak): Drop session usage
declare module 'express-session' {
    interface SessionData {
        token: string
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
function getTokenFromHeaderOrCookie(req: Request) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }

    // TODO(kantoniak): Drop session usage
    if (req.session?.token) {
        return req.session?.token;
    }

    return null;
}

// Adds token to request
declare global {
    namespace Express {
        interface Request {
            token_payload?: TokenPayload
        }
    }
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
    errorIfNoToken
];

const optionalToken = jwt({
    ...jwtBaseOptions,
    credentialsRequired: false
});

export { requireToken, optionalToken };
export type { TokenPayload };
