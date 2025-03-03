import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PlaylistService from "@/services/Playlist";
import { useLoading } from "@/hooks/loading";
import { Playlist } from "@/pages/painel";
import { useStorage } from "@/hooks/storage";
import LiveCard from "@/pages/playlist/live-streams/components/LiveCard";
import Header from "@/components/Header";

export type Category = {
  category_id: string;
  category_name: string;
  parent_id: number;
};

export type Stream = {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id?: string;
  added: string;
  is_adult: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
};

export default function LiveStreamsView() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const { /** loading,**/ setLoading } = useLoading();
  // const searchInput = useRef<HTMLInputElement | null>(null);
  const playlistStorage = useStorage<Playlist[]>();
  const [searchView, setSearchView] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [streams, setStreams] = useState<Stream[] | null>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [categories, setCategories] = useState<Category[] | null>();
  const [searchStreams, setSearchStreams] = useState<Stream[] | null>();
  // const [response, setResponse] = useState<Response>();
  const [service, setService] = useState<PlaylistService | null>(null);

  const query = searchParams.get("q");

  function handleSearch(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.preventDefault();
    if (!streams) return;

    console.log(searchText);
    if (searchText.length <= 0) {
      setSearchView(false);
      return;
    }

    const searchTerm = searchText.toLowerCase().trim();
    const list = streams.filter(
      (item) => item.name?.toLowerCase().includes(searchTerm) ?? false
    );
    setSearchStreams(list);
    setSearchView(true);
  }

  useEffect(() => {
    setLoading(true);
    if (!params.id) return;
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
      service.getLiveCategories(params.id as string),
      service.getUser(params.id as string),
      service.getAllStreams(params.id as string),
    ]);

    data.then(async (res) => {
      if (!res) return;
      setStreams((await res[2])?.data as Stream[]);
      setCategories((await res[0])?.data as Category[]);
      setLoading(false);
    });
  }, [service]);

  useEffect(() => {
    if (!query || !streams) return;

    // Use o query parameter diretamente ao invés de searchText
    const searchTerm = query.toLowerCase().trim();
    const list = streams.filter(
      (item) =>
        item.name?.toLowerCase().includes(decodeURIComponent(searchTerm)) ??
        false
    );

    setSearchText(query);
    setSearchStreams(list);
    setSearchView(true);
  }, [query, streams]); // Removemos searchText das dependências

  return (
    <div>
      <Header
        options={{
          fixed: true,
          back: `/playlist/${params.id}`,
          playlist: playlist as Playlist,
          search: {
            setSearchText,
            handleSearch,
            searchText,
            searchType: "handle",
          },
        }}
      />
      <main className="grid grid-cols-4 py-32 px-5 relative">
        {searchView && (
          <div className="fixed top-0 bottom-0 left-0 w-full bg-background z-30 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
            <div className="grid grid-cols-5 py-32 px-8">
              {searchStreams &&
                searchStreams.map((stream) => (
                  <LiveCard
                    key={stream.stream_id}
                    stream={stream}
                    categories={categories as Category[]}
                    orientation="vertical"
                    playlist={playlist as Playlist}
                  />
                ))}
            </div>
          </div>
        )}
        {streams &&
          !searchView &&
          streams.map((stream) => (
            <LiveCard
              key={stream.stream_id}
              stream={stream}
              categories={categories as Category[]}
              orientation="vertical"
              playlist={playlist as Playlist}
            />
          ))}
      </main>
    </div>
  );
}
