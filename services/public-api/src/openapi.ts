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

// Adds sorting to request
enum SortDir {
    Ascending = 'asc',
    Descending = 'desc'
}

type SortingInfo = {
    by: string,
    dir: SortDir
}

declare global {
    namespace Express {
        interface Request {
            sorting?: SortingInfo
        }
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ArgSortDir:
 *       type: string
 *       enum: [asc, desc]
 *       default: "asc"
 */
function buildSortingHandler(sortBy: string[], defaultCriteria?: string) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Defaults
        let sorting = {
            by: defaultCriteria,
            dir: SortDir.Ascending
        };

        if (req.query.sort !== undefined) {
            if (sortBy.includes(<string>req.query.sort)) {
                sorting.by = <string>req.query.sort;
            }
        }

        if (req.query.sort_dir !== undefined) {
            const sort_dir = <string>req.query.sort_dir;
            if (sort_dir == SortDir.Ascending) {
                sorting.dir = SortDir.Ascending;
            } else if (sort_dir == SortDir.Descending) {
                sorting.dir = SortDir.Descending;
            }
        }

        if (sorting.by !== undefined) {
            req.sorting = <SortingInfo>sorting;
        }

        next();
    }
}

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

export { handlePagination, buildSortingHandler };
