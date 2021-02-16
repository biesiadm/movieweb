import { AxiosResponse } from 'axios';
import { validate as validateUuid } from 'uuid';
import { UserWeb } from '../api/users';
import * as cache from '../cache';
import { usersApi } from '../config';
import { Pagination } from '../middleware';
import { PaginatedUsers, PublicUser } from '../openapi';
import { throwOnInvalidUuid } from '../utils';

const convertToPublic = (users: UserWeb[]): PublicUser[] => {
    return users.map(u => <PublicUser>u);
}

const fetchUsers = async (paging?: Pagination): Promise<PaginatedUsers> => {
    const skip = paging?.skip;
    const limit = paging?.limit;

    const resp = await usersApi.readUsersApiUsersGet(skip, limit);
    const users = convertToPublic(resp.data.users);
    users.forEach(cache.setUser);

    return {
        users: users,
        info: resp.data.info
    }
}

const fetchUsersById = async (ids: string[]): Promise<PublicUser[]> => {
    ids.forEach(throwOnInvalidUuid);

    // Fetch cached
    const cacheResp = await Promise.all(ids.map(cache.getUser));
    const cachedUsers: PublicUser[] = <PublicUser[]>(cacheResp.filter(u => u != null));
    const cachedIds = cachedUsers.map(u => u.id);

    // Fetch others
    let users: PublicUser[] = [];
    const missingIds = ids.filter((id) => !cachedIds.includes(id));
    if (missingIds.length > 0) {
        const userResps = await Promise.all(missingIds.map(usersApi.readUserByIdApiUsersUserIdGet))
        users = convertToPublic(userResps.map((r: AxiosResponse<UserWeb>) => r.data));
        users.forEach(cache.setUser);
    }

    // Merge and reorder
    users = users.concat(cachedUsers);
    let orderedUsers: PublicUser[] = [];
    ids.forEach((id, i) => {
        orderedUsers[i] = <PublicUser>users.find(user => user.id == id);
    });

    return orderedUsers;
}

const fetchUsersByLogin = async (logins: string[]): Promise<PublicUser[]> => {
    const userResps = await Promise.all(logins.map(usersApi.readUserByLoginApiUsersUserUserLoginGet));
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
    fetchUsersById,
    fetchUsersByLogin
};
