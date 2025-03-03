export const PLAYER_ENDPOINT = "/player_api.php";
// /live/{username}/password/stream_id.ts
export const LIVE_ENDPOINT = "/live";

export const PLAYER_QUERIES = {
  PLAYER_USER: "username",
  PLAYER_PASSWORD: "password",
  PLAYER_ACTION: "action",
  ACTIONS: {
    CATEGORIES: "get_live_categories",
    STREAMS: "get_live_streams",
    EPG: "get_short_epg",
  },
  FILTERS: {
    CATEGORY_ID: "category_id",
    STREAM_ID: "stream_id",
  },
  DEFAULTS: {
    CATEGORY_DEFAULT: "ALL",
  },
};
