import { NextFunction, Response, Request } from 'express';
import { validate as validateUuid } from 'uuid';
import { HTTPValidationError } from './api/movies/api';

function buildIdHandler(idField: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const id: string = req.params[idField];
        if (!validateUuid(id)) {
            const err: HTTPValidationError = {
                detail: [
                    {
                        loc: ["path", idField],
                        msg: `Parameter {${idField}} is not a valid UUID.`,
                        type: "type_error.uuid"
                    }
                ]
            };
            res.status(422).json(err).send();
            return;
        }

        next();
    }
}

/**
 * @swagger
 * components:
 *   parameters:
 *     id:
 *       in: path
 *       name: id
 *       schema:
 *         type: string
 *         format: uuid
 *       required: true
 *       description: Object ID as UUID v4
 */
const errorIfIdNotValid = buildIdHandler('id');


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
 *   parameters:
 *     limit:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 100
 *       required: false
 *       description: Maximum number of elements to fetch.
 *     skip:
 *       in: query
 *       name: skip
 *       schema:
 *         type: integer
 *         minimum: 0
 *         default: 0
 *       required: false
 *       description: Offset for selecting sorted items.
 */
function handlePagination(req: Request, res: Response, next: NextFunction) {

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
 *   parameters:
 *     sort_dir:
 *       in: query
 *       name: sort_dir
 *       schema:
 *         $ref: "#/components/schemas/SortDir"
 *       required: false
 *       description: Sorting direction. Used only when "sort" is defined.
 *   schemas:
 *     SortDir:
 *       type: string
 *       enum: [asc, desc]
 *       default: "asc"
 */
function buildSortingHandler(sortBy: string[], defaultCriteria?: string) {
    return (req: Request, res: Response, next: NextFunction) => {
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

function buildErrorPassthrough(codesToPass: Array<number>, res: Response, next: NextFunction) {
    return (reason: any) => {
        if (reason.response && codesToPass.includes(reason.response.status)) {
            res.status(reason.response.status).json(reason.response.data);
        } else {
            res.status(500).send();
        }
    }
}

export { buildSortingHandler, buildErrorPassthrough, buildIdHandler, errorIfIdNotValid, handlePagination };
