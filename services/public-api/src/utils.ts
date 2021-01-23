import { NextFunction, Response } from 'express';

function buildErrorPassthrough(codesToPass: Array<number>, res: Response, next: NextFunction) {
    return (reason: any) => {
        if (codesToPass.includes(reason.response!.status)) {
            res.status(reason.response.status).json(reason.response.data);
            return next();
        } else {
            console.log(reason);
            res.status(500).send();
            return next(reason);
        }
    }
}

export { buildErrorPassthrough };
