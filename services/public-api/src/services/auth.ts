import { AxiosResponse } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Token, HTTPValidationError } from '../api/users/api';
import { loginApi } from '../config';
import { buildErrorPassthrough } from '../middleware';
import { fetchUserById } from '../providers/users';
import { TokenPayload } from '../token';

const router = express.Router();

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
function requireLogInCredentials(req: express.Request, res: express.Response, next: express.NextFunction) {

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

/**
 * @swagger
 * components:
 *   responses:
 *     TokenResponse:
 *       description: JWT token.
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             required:
 *               - access_token
 *               - token_type
 *             properties:
 *               access_token:
 *                 type: "string"
 *               token_type:
 *                 type: "string"
 *                 enum: [bearer]
 */

/**
 * @swagger
 * /auth/authorize:
 *   post:
 *     operationId: authorize
 *     summary: Obtain JWT token
 *     description: Creates a new JWT. Tokens are ignored if user has started a session.
 *     tags: [auth]
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: "#/components/schemas/LogInCredentials"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TokenResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/authorize", bodyParser.urlencoded({ extended: false, parameterLimit: 2 }));
router.post("/authorize", requireLogInCredentials);
router.post("/authorize", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const email = req.body.username;
    const password = req.body.password;
    try {
        const tokenResp: AxiosResponse<Token> =
            await loginApi.loginAccessTokenApiUsersLoginAccessTokenPost(email, password);
        res.status(tokenResp.status).json(tokenResp.data);
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 413, 422], res, next);
        return handler(reason);
    }
});

/**
 * @swagger
 * /auth/log-in:
 *   post:
 *     operationId: logIn
 *     summary: Obtain JWT token as cookie
 *     tags: [auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LogInCredentials"
 *     responses:
 *       200:
 *         description: User details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: connect.sid=abcde12345; Domain=localhost; Path=/; HttpOnly
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/log-in", bodyParser.json());
router.post("/log-in", requireLogInCredentials);
router.post("/log-in", async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    if (req.cookies['token']) {
        const error = {
            detail: "Already logged in."
        };
        res.status(400).json(error);
        return;
    }

    const email = req.body.username;
    const password = req.body.password;
    try {
        const tokenResp: AxiosResponse<Token> =
            await loginApi.loginAccessTokenApiUsersLoginAccessTokenPost(email, password);

        const token = tokenResp.data.access_token;
        res.cookie('token', token, { httpOnly: true });

        const payload: TokenPayload = <any>jwt.decode(token);
        const user = await fetchUserById(payload.sub);
        res.status(200).json(user);
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 413, 422], res, next);
        return handler(reason);
    }
});

/**
 * @swagger
 * /auth/log-out:
 *   get:
 *     operationId: logOut
 *     summary: Drop JWT token cookie
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Logged out successfully.
 */
router.get("/log-out", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies['token']) {
        delete req.cookies['token'];
        res.clearCookie('token');
    }

    res.status(200).send();
    return next();
});

export default router;
