import { useParams } from "react-router-dom";
import { useLoading } from "@/hooks/loading";
import { useEffect, useState } from "react";
import { Category, Stream } from "..";
import PlaylistService from "@/services/Playlist";
import { useStorage } from "@/hooks/storage";
import { Playlist } from "@/pages/painel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import HlsPlayer from "./players/hls";
import LiveCard from "@/pages/playlist/live-streams/components/LiveCard";
import Header from "@/components/Header";

export type StreamEpg = {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
};

export default function LiveView() {
  const params = useParams();
  const { /**loading,**/ setLoading } = useLoading();
  const playlistStorage = useStorage<Playlist[]>();

  const [streams, setStreams] = useState<Stream[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [mutualStreams, setMutualStreams] = useState<Stream[] | null>(null);
  const [liveStream, setLiveStream] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamEpg, setEpg] = useState<StreamEpg[] | null>(null);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [service, setService] = useState<PlaylistService | null>(null);
  const [searchText, setSearchText] = useState("");

  function decodeBase64Utf8(base64String: string) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(
      [...binaryString].map((char) => char.charCodeAt(0))
    );
    return new TextDecoder("utf-8").decode(bytes);
  }

  function handleSearch() {
    window.location.href = `/playlist/${
      playlist?.id
    }/live-streams?q=${encodeURIComponent(searchText)}`;
  }

  useEffect(() => {
    setLoading(true);
    if (!params.id && !params.stream_id) return;
    const storagePlaylist = playlistStorage.get("user_playlist");
    if (!storagePlaylist) return;

    const item = storagePlaylist.filter((item) => item.id === params.id)[0];
    setPlaylist(item);

    const playlistService = new PlaylistService({ base: item.url });
    setService(playlistService);
  }, []);

  useEffect(() => {
    if (!service) return;
    const data = Promise.all([
      service.getAllStreams(params.id as string),
      service.getLiveCategories(params.id as string),
      service.getLiveEpg(params.id as string, params.stream_id as string),
    ]);

    data.then(async (res) => {
      if (!res) return;

      setStreams((await res[0])?.data as Stream[]);
      setCategories((await res[1])?.data as Category[]);

      const epgMap = ((await res[2])?.data.epg_listings as StreamEpg[]).map(
        (epg) => ({
          ...epg,
          title: decodeBase64Utf8(epg.title),
          description: decodeBase64Utf8(epg.description)
            .split('"},"')[0]
            .replace(/\\"/g, '"'),
        })
      );

      setEpg(epgMap);

      const source = await service.getLiveStreamUrl(
        playlist?.id as string,
        "m3u8",
        params.stream_id as string
      );

      setLiveStream(source as string);
      setLoading(false);
    });
  }, [service]);

  useEffect(() => {
    if (!streams) return;

    const stream = streams.find(
      (item) => item.stream_id.toString() === params.stream_id
    );

    if (!stream) return;
    const mutual = streams.filter(
      (item) => stream.category_id === item.category_id
    );

    setCurrentStream(stream);
    setMutualStreams(mutual);
    setLoading(false);
  }, [streams]);

  return (
    <div>
      <Header
        options={{
          fixed: true,
          back: `/playlist/${params.id}/live-streams`,
          playlist: playlist as Playlist,
          search: {
            setSearchText,
            handleSearch,
            searchText,
            searchType: "redirect",
          },
        }}
      />
      <div className="py-20 px-2">
        <div className="flex justify-between gap-4">
          <div className="w-full">
            {liveStream && (
              <div className="flex flex-col ml-2 mt-2">
                <HlsPlayer
                  epg={streamEpg as StreamEpg[]}
                  stream={currentStream as Stream}
                  src={liveStream}
                />
                <div className="text-4xl mb-2 mt-2 font-bold">
                  <h1>{currentStream?.name}</h1>
                </div>
                <div className="mb-2 text-zinc-400">
                  <span>
                    {
                      categories?.find(
                        (cat) => currentStream?.category_id === cat.category_id
                      )?.category_name
                    }
                  </span>
                </div>
                <div className="flex flex-col bg-zinc-900 px-5 py-5 rounded-lg mt-2">
                  <div className="flex items-center gap-3 font-bold">
                    <Avatar>
                      <AvatarFallback>
                        {playlist?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <h1>{playlist?.name}</h1>
                      <span className="text-zinc-400">
                        {playlist?.username}
                      </span>
                    </div>
                  </div>
                  {streamEpg && (
                    <div className="mt-5">
                      <h1 className="text-2xl font-bold">Programação</h1>
                      <div className="mt-2">
                        {streamEpg.length <= 0 ? (
                          <>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex flex-col text-zinc-300">
                                <h1 className="text-1xl">
                                  Não há programação para este canal
                                </h1>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {streamEpg.map((epg) => (
                              <>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="flex flex-col text-zinc-300">
                                    <h1 className="text-1xl">
                                      {epg.title} -{" "}
                                      {new Date(epg.start).toLocaleTimeString(
                                        "pt-br",
                                        { hour: "2-digit", minute: "2-digit" }
                                      )}{" "}
                                      -{" "}
                                      {new Date(epg.end).toLocaleTimeString(
                                        "pt-br",
                                        { hour: "2-digit", minute: "2-digit" }
                                      )}
                                    </h1>
                                    <div className="pl-2 ml-1 border-l border-l-zinc-500 text-zinc-500">
                                      <span>{epg.description}</span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1">
            {mutualStreams?.map((stream) => (
              <LiveCard
                stream={stream}
                categories={categories as Category[]}
                playlist={playlist as Playlist}
                orientation="horizontal"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
