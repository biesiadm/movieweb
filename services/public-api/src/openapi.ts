import swaggerJSDoc from 'swagger-jsdoc';
import OpenapiDef from '../openapi-definition.json';

const OpenapiSpec = swaggerJSDoc({
    swaggerDefinition: OpenapiDef,
    apis: [
        "src/*.{js,ts}",
        "src/services/*.{js,ts}"
    ]
});
export default OpenapiSpec;

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
