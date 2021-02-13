import md5 from 'md5';
import { AxiosResponse } from 'axios';
import { UserWeb } from '../api/users';
import { usersApi } from '../config';
import { PublicUser } from '../openapi';

const fetchUsers = async (user_ids: string[]): Promise<PublicUser[]> => {
    // TODO(kantoniak): Validate UUID
    return Promise
        .all(user_ids.map(usersApi.readUserByIdApiUsersUserIdGet))
        .then((responses: AxiosResponse<UserWeb>[]) => {
            return responses.map(response => {
                let user: Partial<PublicUser> = response.data;
                user.login = response.data.id;
                // TODO(kantoniak): Get rid of md5 when we move slugs to service API
                // There should be an email istead of hash, but we don't have it in public-api.
                const gravatarHash = md5(user.login!.trim().toLowerCase());
                user.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=128&r=g`;
                return <PublicUser>user;
            });
        });
}

export { fetchUsers };
