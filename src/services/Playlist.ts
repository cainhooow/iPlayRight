import axios, { AxiosInstance } from "axios";
import { useStorage } from "@/hooks/storage";
import { PLAYER_ENDPOINT, PLAYER_QUERIES } from "@/utils/constants";
import { unhashText } from "@/utils/iid";
import { Playlist } from "@/types/Playlist";

export default class PlaylistService {
  private baseUrl: string | undefined;
  private api: AxiosInstance = axios;
  private storage = useStorage();

  constructor({ base }: { base: string }) {
    this.baseUrl = base;

    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // "X-Requested-With": "XMLHttpRequest",
      },
    });

    this.api.interceptors.request.use((config) => {
      if (config.url) {
        config.url = config.url.replace(/\/+$/, "");
      }
      return config;
    });

    console.log(this.api.interceptors);
  }

  public async getUser(playlistId: string) {
    const playlist = this.findPlaylistById(playlistId);
    if (!playlist) return;

    const authQuery = await this.buildAuthQuery(
      playlist.username,
      playlist.password
    );
    if (!authQuery) return;

    const data = await this.api.get(`${authQuery}`);

    return data;
  }

  public async getLiveCategories(playlistId: string) {
    const playlist = this.findPlaylistById(playlistId);
    if (!playlist) return;

    const authQuery = await this.buildAuthQuery(
      playlist.username,
      playlist.password
    );

    if (!authQuery) return;

    const data = await this.api.get(
      `${authQuery}&${PLAYER_QUERIES.PLAYER_ACTION}=${PLAYER_QUERIES.ACTIONS.CATEGORIES}`
    );

    return data;
  }

  public async getAllStreams(playlistId: string) {
    const playlist = this.findPlaylistById(playlistId);
    if (!playlist) return;

    const authQuery = await this.buildAuthQuery(
      playlist.username,
      playlist.password
    );

    const data = await this.api.get(
      `${authQuery}&${PLAYER_QUERIES.PLAYER_ACTION}=${PLAYER_QUERIES.ACTIONS.STREAMS}&${PLAYER_QUERIES.FILTERS.CATEGORY_ID}=${PLAYER_QUERIES.DEFAULTS.CATEGORY_DEFAULT}`
    );

    return data;
  }

  public async getLiveStream(
    playlistId: string,
    ext: string,
    stream_id: string
  ) {
    const playlist = this.findPlaylistById(playlistId);
    if (!playlist) return;

    const liveQuery = await this.buildLiveAuthQuery(playlist.username);
    const data = await this.api.get(`${liveQuery}/${stream_id}.${ext}`);

    return data;
  }

  public async getLiveEpg(playlistId: string, stream_id: string) {
    const playlist = this.findPlaylistById(playlistId);
    if (!playlist) return;

    const authQuery = await this.buildAuthQuery(
      playlist.username,
      playlist.password
    );
    const data = await this.api.get(
      `${authQuery}&${PLAYER_QUERIES.PLAYER_ACTION}=${PLAYER_QUERIES.ACTIONS.EPG}&${PLAYER_QUERIES.FILTERS.STREAM_ID}=${stream_id}`
    );

    return data;
  }

  public async getLiveStreamUrl(
    playlistId: string,
    ext: string,
    stream_id: string
  ) {
    const playlist = this.findPlaylistById(playlistId);
    if (!playlist) return;
    const liveQuery = await this.buildLiveAuthQuery(playlist.username);

    return `${this.api.defaults.baseURL}${liveQuery}/${stream_id}.${ext}`;
  }

  private findPlaylistById(playlistId: string) {
    return this.storage
      .get<Playlist[]>("user_playlist")
      ?.filter((item) => playlistId === item.id)[0];
  }

  public async buildLiveAuthQuery(username: string) {
    const credentials = await this.getUserCredentials(username);

    return `/live/${credentials?.username}/${credentials?.password}`;
  }

  private async buildAuthQuery(username: string, password: string) {
    const key = this.storage.get<string>("iikey");
    if (!key) return;

    const originalPassword = await unhashText(password, key);
    return `${PLAYER_ENDPOINT}?${PLAYER_QUERIES.PLAYER_USER}=${username}&${PLAYER_QUERIES.PLAYER_PASSWORD}=${originalPassword}`;
  }

  private async getUserCredentials(username: string) {
    const key = this.storage.get<string>("iikey");
    const playlist = this.storage.get<Playlist[]>("user_playlist");
    if (!key || !playlist) return;

    const user = playlist.find((item) => item.username === username);
    if (!user) return;
    const originalPassword = await unhashText(user.password, key);

    return {
      username: user.username,
      password: originalPassword,
    };
  }
}
