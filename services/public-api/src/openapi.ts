import swaggerJSDoc from 'swagger-jsdoc';
import OpenapiDef from '../openapi-definition.json';

const OpenapiSpec = swaggerJSDoc({
    swaggerDefinition: OpenapiDef,
    apis: [
        "src/openapi.{js,ts}",
        "src/services/*.{js,ts}"
    ]
});
export default OpenapiSpec;

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidationError:
 *       title: "ValidationError"
 *       type: "object"
 *       properties:
 *         loc:
 *           title: "Location"
 *           type: "array"
 *           items:
 *             type: "string"
 *         msg:
 *           title: "Message"
 *           type: "string"
 *         type:
 *           title: "Error Type"
 *           type: "string"
 *     HTTPValidationError:
 *       title: "HTTPValidationError"
 *       type: "object"
 *       properties:
 *         detail:
 *           title: "Detail"
 *           type: "array"
 *           items:
 *             $ref: "#/components/schemas/ValidationError"
 */
