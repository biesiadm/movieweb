import { AxiosResponse } from 'axios';
import { UserWeb } from '../api/users';
import { usersApi } from '../config';
import { PublicUser } from '../openapi';

const fetchUsers = async (skip?: number, limit?: number): Promise<PublicUser[]> => {
    const usersResp = await usersApi.readUsersApiUsersGet(skip, limit);
    return usersResp.data.map((u: UserWeb) => <PublicUser>u);
}

const fetchUsersById = async (user_ids: string[]): Promise<PublicUser[]> => {
    // TODO(kantoniak): Validate UUIDs
    const userResps = await Promise.all(user_ids.map(usersApi.readUserByIdApiUsersUserIdGet));
    return userResps.map((r: AxiosResponse<UserWeb>) => <PublicUser>(r.data));
}

const fetchUserById = async (id: string): Promise<PublicUser> => {
    return (await fetchUsersById([id]))[0];
}

// Currently unused
const fetchNullableUserById = async (id:string): Promise<PublicUser | null> => {
    // TODO(kantoniak): Validate UUID
    try {
        const users = await fetchUsersById([id]);
        return users[0];
    } catch (error) {
        if (error.response?.status && error.response.status == 404) {
            return null;
        } else {
            throw error;
        }
    }
}

export { fetchUsers, fetchUserById, fetchNullableUserById, fetchUsersById };
