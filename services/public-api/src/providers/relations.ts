import { relsApi } from "../config";

const isFollowing = async (follower_id: string, user_id: string): Promise<boolean> => {
    const followResp = await relsApi.checkRelationshipApiRelationshipsUsersUserIdFollowersFollowedUserIdGet(follower_id, user_id);
    return followResp.data;
}

export { isFollowing };
