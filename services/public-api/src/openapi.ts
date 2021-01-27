import swaggerJSDoc from 'swagger-jsdoc';
import OpenapiDef from '../openapi-definition.json';
import { Movie } from './api/movies';
import { User } from './api/users';

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
 */
interface PublicMovie extends Movie {

    /**
     *
     * @type {string}
     * @memberof PublicMovie
     */
    slug: string;
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
 *         email:
 *           type: "string"
 *           format: "email"
 *         avatar_url:
 *           type: "string"
 *           format: "url"
 *         is_active:
 *           type: "boolean"
 *           default: true
 *         is_superuser:
 *           type: "boolean"
 *           default: false
 */
interface PublicUser extends User {

    // TODO(biesiadm): Move to user API
    /**
     *
     * @type {string}
     * @memberof PublicUser
     */
    login: string;

    // TODO(biesiadm): Move to user API
    /**
     *
     * @type {string}
     * @memberof PublicUser
     */
    avatar_url: string;
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
