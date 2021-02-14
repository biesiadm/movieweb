import { AxiosResponse } from 'axios';
import { validate as validateUuid } from 'uuid';
import { UserWeb } from '../api/users';
import { usersApi } from '../config';
import { Pagination } from '../middleware';
import { PublicUser } from '../openapi';
import { throwOnInvalidUuid } from '../utils';

const fetchUsers = async (paging?: Pagination): Promise<PublicUser[]> => {
    const skip = paging?.skip;
    const limit = paging?.limit;
    const usersResp = await usersApi.readUsersApiUsersGet(skip, limit);
    return usersResp.data.map((u: UserWeb) => <PublicUser>u);
}

const fetchUsersById = async (user_ids: string[]): Promise<PublicUser[]> => {
    user_ids.forEach(throwOnInvalidUuid);
    const userResps = await Promise.all(user_ids.map(usersApi.readUserByIdApiUsersUserIdGet));
    return userResps.map((r: AxiosResponse<UserWeb>) => <PublicUser>(r.data));
}

const fetchUserById = async (id: string): Promise<PublicUser> => {
    return (await fetchUsersById([id]))[0];
}

// Currently unused
const fetchNullableUserById = async (id:string): Promise<PublicUser | null> => {
    if (!validateUuid(id)) {
        return null;
    }

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

export {
    fetchNullableUserById,
    fetchUserById,
    fetchUsers,
    fetchUsersById
};
