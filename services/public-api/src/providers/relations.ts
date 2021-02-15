import { Relationship } from "../api/relations";
import { relsApi } from "../config";
import { Pagination, Sorting } from "../middleware";
import { throwOnInvalidUuid } from "../utils";

const fetchFollowerIdsByUserId = async (user_id: string, paging?: Pagination, sorting?: Sorting): Promise<string[]> => {
    throwOnInvalidUuid(user_id);
    const skip = paging?.skip;
    const limit = paging?.limit;
    const sort = sorting?.by;
    const sortDir = <string>(sorting?.dir);

    const resp = await relsApi.readUserFollowersApiRelationshipsFollowingUserIdGet(user_id, skip, limit, sort, sortDir);
    return resp.data.map((r: Relationship) => r.user_id);
}


const fetchFollowingIdsByUserId = async (user_id: string, paging?: Pagination, sorting?: Sorting): Promise<string[]> => {
    throwOnInvalidUuid(user_id);
    const skip = paging?.skip;
    const limit = paging?.limit;
    const sort = sorting?.by;
    const sortDir = <string>(sorting?.dir);

    const resp = await relsApi.readFollowingByUserApiRelationshipsFollowedByUserIdGet(user_id, skip, limit, sort, sortDir);
    return resp.data.map((r: Relationship) => r.followed_user_id);
}

const isFollowing = async (follower_id: string, user_id: string): Promise<boolean> => {
    const followResp = await relsApi.checkRelationshipApiRelationshipsUsersUserIdFollowersFollowedUserIdGet(follower_id, user_id);
    return followResp.data;
}

export {
    fetchFollowerIdsByUserId,
    fetchFollowingIdsByUserId,
    isFollowing
};
