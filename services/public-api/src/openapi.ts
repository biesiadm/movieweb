import express from 'express';
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

// Adds pagination to request
declare global {
    namespace Express {
        interface Request {
            pagination?: {
                limit: number,
                skip: number
            }
        }
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ArgLimit:
 *       type: integer
 *       minimum: 1
 *       default: 100
 *     ArgSkip:
 *       type: integer
 *       minimum: 0
 *       default: 0
 */
function handlePagination(req: express.Request, res: express.Response, next: express.NextFunction) {

    // Defaults
    req.pagination = {
        limit: 100,
        skip: 0
    };

    if (req.query.limit !== undefined) {
        const limit = Number(req.query.limit);
        if (!isNaN(limit) && isFinite(limit) && limit > 0) {
            req.pagination.limit = limit;
        }
    }

    if (req.query.skip !== undefined) {
        const skip = Number(req.query.skip);
        if (!isNaN(skip) && isFinite(skip) && skip >= 0) {
            req.pagination.skip = skip;
        }
    }

    next();
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ArgSortDir:
 *       type: string
 *       enum: [asc, desc]
 *       default: "asc"
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

export { handlePagination };
