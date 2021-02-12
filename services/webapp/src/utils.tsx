import { Location } from 'history';

type EmptyProps = Record<string, never>;
type EmptyState = Record<string, never>;

function getLogInPath(location: Location) {
    let query = new URLSearchParams();
    query.append('redirect', location.pathname);
    return ('/login?' + query.toString());
}

export type { EmptyProps, EmptyState };
export { getLogInPath };
