import express from 'express';
import asyncHandler from 'express-async-handler';
import { errorIfIdNotValid, handlePagination, Pagination } from '../middleware';
import { optionalToken } from '../token';
import { fetchNullableUserById, fetchUserById, fetchUsers, fetchUsersByLogin } from '../providers/users';
import { isFollowing } from '../providers/relations';
import { HTTPValidationError } from '../api/movies';

const router = express.Router();

/**
 * @swagger
 * components:
 *   responses:
 *     UserListResponse:
 *       description: List of users.
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               required:
 *                 - users
 *                 - info
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 info:
 *                   $ref: '#/components/schemas/ListInfo'
 */

/**
 * @swagger
 * /users:
 *   get:
 *     operationId: getUsers
 *     summary: Retrieve a list of users
 *     tags: [users]
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: login
 *         schema:
 *           type: "array"
 *           items:
 *             type: "string"
 *         required: false
 *         description: Limits results to provided login or logins. Max 50 entries.
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get("/", handlePagination);
router.get("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    if (req.query?.login) {
        // Validate logins
        let logins = <string[] | null>req.query.login;
        if (typeof logins === 'string') {
            logins = [logins];
        }
        if (!Array.isArray(logins) ||
            logins.length > 50 ||
            !(logins.every((login: any) => (typeof login === 'string')))) {
            throw <HTTPValidationError>{
                detail: [
                    {
                        loc: ['query', 'login'],
                        msg: 'Parameter login not valid.',
                        type: 'param'
                    }
                ]
            };
        }

        // Manual pagination
        const paging: Pagination = req.pagination!;
        const pageLogins = logins.slice(paging.skip, paging.skip + paging.limit);

        const users = await fetchUsersByLogin(pageLogins);
        const responseBody = {
            users: users,
            info: {
                count: users.length,
                totalCount: logins.length
            }
        };
        res.status(200).json(responseBody);
        return next();
    }

    // Fetch all users
    const users = await fetchUsers(req.pagination!);

    // TODO(biesiadm): Pass info from the service
    const responseBody = {
        users: users,
        info: {
            count: users.length,
            totalCount: req.pagination!.skip + users.length
        }
    };

    res.status(200).json(responseBody);
    return next();
}));

/**
 * @swagger
 * /users/me:
 *   get:
 *     operationId: getCurrentUser
 *     summary: Get current user using token
 *     tags: [users]
 *     security:
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: User details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
router.get("/me", optionalToken);
router.get("/me", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    if (!req.token_payload) {
        res.status(404).send();
    }

    const user_id: string = req.token_payload!.sub!;
    const user = await fetchNullableUserById(user_id);
    if (user) {
        res.status(200).json(user);
    } else {
        // Clear invalid cookie
        if (req.cookies['token']) {
            delete req.cookies['token'];
            res.clearCookie('token');
        }
        res.status(404).send();
    }
    return next();
}));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     operationId: getUserById
 *     summary: Get user by ID
 *     tags: [users]
 *     security:
 *       - {}
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: User details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get("/:id", errorIfIdNotValid);
router.get("/:id", optionalToken);
router.get("/:id", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user_id: string = req.params.id;
    const user = await fetchUserById(user_id);

    if (req.token_payload) {
        const follower_id = req.token_payload.sub;
        user.following = await isFollowing(follower_id, user_id);
    }

    res.status(200).json(user);
    next();
}));

export default router;
