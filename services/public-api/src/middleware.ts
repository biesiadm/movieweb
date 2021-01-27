import { NextFunction, Response, Request } from 'express';
import { validate as validateUuid } from 'uuid';
import { HTTPValidationError } from './api/movies/api';

function errorIfIdNotValid(req: Request, res: Response, next: NextFunction) {

    const id: string = req.params.id;
    if (!validateUuid(id)) {
        const err: HTTPValidationError = {
            detail: [
                {
                    loc: ["path", "id"],
                    msg: "Parameter {id} is not a valid UUID.",
                    type: "type_error.uuid"
                }
            ]
        };
        res.status(422).json(err);
        next(err);
    }

    next();
}


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
 *   schemas:
 *     ArgSortDir:
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
            return next();
        } else {
            console.log(reason);
            res.status(500).send();
            return next(reason);
        }
    }
}

export { buildSortingHandler, buildErrorPassthrough, errorIfIdNotValid, handlePagination };
