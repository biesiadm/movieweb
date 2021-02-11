import { AxiosResponse } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import { Token } from '../api/users/api';
import { loginApi } from '../config';
import { buildErrorPassthrough } from '../middleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: "object"
 *       required:
 *         - access_token
 *         - token_type
 *       properties:
 *         access_token:
 *           type: "string"
 *         token_type:
 *           type: "string"
 *           enum: [bearer]
 */

/**
 * @swagger
 * components:
 *   responses:
 *     TokenResponse:
 *       description: JWT token.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Token'
 */

/**
 * @swagger
 * /auth/authorize:
 *   post:
 *     operationId: authorize
 *     summary: Obtain JWT token
 *     tags: [auth]
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/TokenResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/authorize", bodyParser.urlencoded({ extended: false, parameterLimit: 2 }));
router.post("/authorize", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // Parse parameters
    const email = req.body?.username;
    const password = req.body?.password;
    if (!email || !password) {
        const error = {
            detail: "Missing required parameters"
        };
        res.status(400).json(error);
        return next();
    }

    loginApi.loginAccessTokenApiUsersLoginAccessTokenPost(email, password)
        .then((axiosResponse: AxiosResponse<Token>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([400, 413, 422], res, next));
    return res;
});

export default router;
