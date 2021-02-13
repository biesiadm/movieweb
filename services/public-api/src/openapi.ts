import swaggerJSDoc from 'swagger-jsdoc';
import OpenapiDef from '../openapi-definition.json';
import { Movie } from './api/movies';
import { Review } from './api/reviews';
import { UserWeb } from './api/users';

const OpenapiSpec = swaggerJSDoc({
    swaggerDefinition: OpenapiDef,
    apis: [
        "src/*.{js,ts}",
        "src/services/*.{js,ts}"
    ]
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: "object"
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - poster_url
 *       properties:
 *         id:
 *           type: "string"
 *           format: "uuid"
 *         title:
 *           type: "string"
 *         slug:
 *           type: "string"
 *         poster_url:
 *           type: "string"
 *           format: "url"
 *         background_url:
 *           type: "string"
 *           format: "url"
 *         director:
 *           type: "string"
 *         year:
 *           type: "integer"
 *         country:
 *           type: "string"
 *         category:
 *           type: "string"
 *         review:
 *           $ref: "#/components/schemas/Review"
 */
interface PublicMovie extends Movie {

    // TODO(biesiadm): Move to user API
    slug: string;

    review?: Review;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: "object"
 *       required:
 *         - id
 *         - login
 *         - name
 *         - avatar_url
 *       properties:
 *         id:
 *           type: "string"
 *           format: "uuid"
 *         login:
 *           type: "string"
 *         name:
 *           type: "string"
 *         avatar_url:
 *           type: "string"
 *           format: "url"
 *         following:
 *           type: boolean
 *           description: Set on selected requests when client authenticated. Says if current user is a follower.
 */
interface PublicUser extends UserWeb {

    // TODO(biesiadm): Move to user API
    login: string;

    // TODO(biesiadm): Move to user API
    avatar_url: string;

    following?: boolean;
}

/**
 * @swagger
 * components:
 *   responses:
 *     ValidationError:
 *       description: Validation error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ValidationErrorList"
 *   schemas:
 *     ListInfo:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           minimum: 0
 *           description: Number of entries returned with request.
 *         totalCount:
 *           type: integer
 *           minimum: 0
 *           description: Number of all entries matching criteria.
 *     ValidationErrorList:
 *       type: "object"
 *       properties:
 *         detail:
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/ValidationError"
 *     ValidationError:
 *       type: "object"
 *       properties:
 *         loc:
 *           type: "array"
 *           items:
 *             type: "string"
 *         msg:
 *           type: "string"
 *         type:
 *           type: "string"
 */

export default OpenapiSpec;
export type { PublicMovie, PublicUser };
