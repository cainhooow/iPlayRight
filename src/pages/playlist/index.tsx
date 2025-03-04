import { Link, useParams } from "react-router-dom";
import { useStorage } from "@/hooks/storage";
import { Playlist } from "@/pages/painel";
import { useEffect, useState } from "react";
import PlaylistService from "@/services/Playlist";
import {
  LucideArrowLeft,
  LucideSettings2,
  LucideTv,
  LucideVideo,
  LucideVideotape,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useLoading } from "@/hooks/loading";
import Header from "@/components/Header";

type server_info = {
  url: string;
  port: string;
  https_port: string;
  server_protocol: string;
  rtmp_port: string;
  timezone: string;
  timestamp_now: number;
  string: Date;
  process: boolean;
};

type user_info = {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
};

export type Response = {
  server_info: server_info;
  user_info: user_info;
};

export function PlaylistView() {
  const params = useParams();
  const playlistStorage = useStorage<Playlist[]>();
  const { setLoading, loading } = useLoading();
  const keyStorage = useStorage<string>();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [service, setService] = useState<PlaylistService | null>(null);

  useEffect(() => {
    setLoading(true);

    const storagePlaylist = playlistStorage.get("user_playlist");
    const storageKey = keyStorage.get("iikey");

    if (!storagePlaylist || !storageKey) return;
    const item = storagePlaylist.filter((item) => item.id === params.id)[0];
    setPlaylist(item);

    const playlistService = new PlaylistService({ base: item.url });
    setService(playlistService);
  }, []);

  useEffect(() => {
    if (!service || !playlist) return;

    service
      .getUser(playlist.id)
      .then((res) => {
        if (!res) return;
        setLoading(false);
        const data = res.data as Response;
        const expMod = parseInt(data.user_info.exp_date) * 1000;

        data.user_info.exp_date = format(expMod, "dd/MM/yyyy");
        setResponse(data);
      })
      .catch((err) => {
        console.log({ err });
        window.location.href = `${import.meta.env.VITE_BASE_URL}?error=${encodeURIComponent(
          err.message
        )}`;
      });
  }, [service, playlist]);

  return (
    <div>
      <Header
        options={{
          fixed: false,
          back: "/",
          playlist: playlist as Playlist,
        }}
      />
      <div className="container mx-auto my-10">
        <div className="flex mb-5 justify-between">
          <div className="flex items-center gap-3">
            <Link to="/painel">
              <Button className="transition-all" variant="ghost" size={"icon"}>
                <LucideArrowLeft />
              </Button>
            </Link>
            <Avatar>
              <AvatarFallback>{playlist?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{playlist?.username}</h1>
              <p className="text-zinc-500">{playlist?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/playlist/${playlist?.id}/settings`}>
              <Button
                className="transition-all"
                variant="outline"
                size={"icon"}
              >
                <LucideSettings2 />
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-rows-2 sm:grid-cols-2 gap-6">
          <Link tabIndex={0} to={`live-streams`} className="border sm:col-span-1 border-zinc-700 h-[450px] hover:bg-zinc-900/20 cursor-pointer rounded-lg flex flex-col items-center justify-center">
            <div className="flex gap-3 mb-2 items-center">
              <LucideTv size={30} />
              <h1 className="text-4xl font-bold">Live TV</h1>
            </div>
            <p className="text-xl text-center">
              Assista aos canais ao vivo da sua playlist
            </p>
          </Link>
          <div tabIndex={0} className="border sm:col-span-2 border-zinc-700 hover:bg-zinc-900/20 cursor-pointer rounded-lg flex flex-col items-center justify-center">
            <div className="flex gap-3 mb-2 items-center">
              <LucideVideo size={30} />
              <h1 className="text-4xl font-bold">Séries</h1>
            </div>
            <p className="text-xl text-center">
              Assista às séries da sua playlist
            </p>
          </div>
          <div tabIndex={0} className="border sm:col-span-3 border-zinc-700 hover:bg-zinc-900/20 cursor-pointer rounded-lg flex flex-col items-center justify-center h-[350px]">
            <div className="flex gap-3 mb-2 items-center">
              <LucideVideotape size={30} />
              <h1 className="text-4xl font-bold">Filmes</h1>
            </div>
            <p className="text-xl text-center">
              Assista aos filmes da sua playlist em um só lugar
            </p>
          </div>
        </div>
        <div className="flex mb-5 mt-8 justify-between">
          <div className="flex items-center gap-3">
            {response && !loading ? (
              <>
                <Avatar>
                  <AvatarFallback>{playlist?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">{playlist?.name}</h1>
                  <p className="text-zinc-500">
                    {playlist?.username} | {response?.server_info.url}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Skeleton className="w-[130px] h-[20px] mb-2" />
                <Skeleton className="w-[60px] h-[20px] mb-2" />
                <Skeleton className="w-[130px] h-[20px] mb-2" />
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              {response && !loading ? (
                <>
                  <h1 className="text-2xl font-bold">Expira em</h1>
                  <p className="text-zinc-500">
                    {response?.user_info.exp_date}
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="w-[130px] h-[20px] mb-2" />
                  <Skeleton className="w-[60px] h-[20px] mb-2" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
