import { Relationship } from "../api/relations";
import { relsApi } from "../config";
import { Pagination, Sorting } from "../middleware";
import { throwOnInvalidUuid } from "../utils";

const fetchFollowerIdsByUserId = async (user_id: string, paging?: Pagination, sorting?: Sorting): Promise<string[]> => {
    throwOnInvalidUuid(user_id);
    const skip = paging?.skip;
    const limit = paging?.limit;

    // TODO(biesiadm): /api/relationships/following/{user_id}?sort=created&sort_dir=desc        [zrobione po stronie serwisu]
    const resp = await relsApi.readUserFollowersApiRelationshipsFollowingUserIdGet(user_id, skip, limit);
    return resp.data.map((r: Relationship) => r.user_id);
}


const fetchFollowingIdsByUserId = async (user_id: string, paging?: Pagination, sorting?: Sorting): Promise<string[]> => {
    throwOnInvalidUuid(user_id);
    const skip = paging?.skip;
    const limit = paging?.limit;

    // TODO(biesiadm): /api/relationships/followed-by/{user_id}?sort=created&sort_dir=desc      [zrobione po stronie serwisu]
    const resp = await relsApi.readFollowingByUserApiRelationshipsFollowedByUserIdGet(user_id, skip, limit);
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
