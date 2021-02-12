import { NextFunction, Response, Request } from 'express';
import { HTTPValidationError } from './api/users';

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

export { requireLogInCredentials, handleTokenExpiration };
export type { TokenPayload };
