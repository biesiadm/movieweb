import { validate as validateUuid } from 'uuid';
import { HTTPValidationError } from './api/reviews';

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

export { throwOnInvalidUuid };
