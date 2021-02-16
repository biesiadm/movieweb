import { Request, Response } from 'express';
import { validate as validateUuid } from 'uuid';
import { HTTPValidationError } from './api/reviews';

const redirectToDocs = (req: Request, res: Response) => {
    res.redirect('/docs');
}

const throwOnInvalidUuid = (identifier: string): void => {
    if (validateUuid(identifier)) {
        return;
    }

    throw <HTTPValidationError>{
        detail: [
            {
                loc: ["parameter"],
                msg: `Parameter is not a valid UUID.`,
                type: "type_error.uuid"
            }
        ]
    };
}

export { redirectToDocs, throwOnInvalidUuid };
