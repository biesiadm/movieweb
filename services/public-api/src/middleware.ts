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

type Pagination = {
    limit: number,
    skip: number
};

// Adds pagination to request
declare global {
    namespace Express {
        interface Request {
            pagination?: Pagination
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

type Sorting = {
    by: string,
    dir: SortDir
}

declare global {
    namespace Express {
        interface Request {
            sorting?: Sorting
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
            req.sorting = <Sorting>sorting;
        }

        next();
    }
}

const handleValidationErrors = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.detail) {
        res.status(422).json(error).send();
        return;
    } else {
        next(error);
    }
}

const sendBackHttp4xxOr500 = (error: any, req: Request, res: Response, next: NextFunction) => {
    const status = error?.response?.status;
    if (status && Number.isInteger(status) && 400 <= status && status < 500) {
        res.status(status).json(error.response.data);
    } else {
        res.status(500).send();
    }
}

export {
    buildIdHandler,
    buildSortingHandler,
    errorIfIdNotValid,
    handlePagination,
    handleValidationErrors,
    sendBackHttp4xxOr500
};
export type { Pagination, Sorting };
