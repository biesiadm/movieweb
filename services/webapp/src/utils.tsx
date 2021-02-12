import { Location } from 'history';
import { ListInfo } from './api/public';

type EmptyProps = Record<string, never>;
type EmptyState = Record<string, never>;

interface AxiosListResponse {
    data: {
        info: ListInfo
    }
}

function getLogInPath(location: Location): string {
    const query = new URLSearchParams();
    query.append('redirect', location.pathname);
    return ('/login?' + query.toString());
}

export type { EmptyProps, EmptyState, AxiosListResponse as PaginatedResponse };
export { getLogInPath };
