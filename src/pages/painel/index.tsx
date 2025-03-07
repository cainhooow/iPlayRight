import { useStorage } from "@/hooks/storage";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlaylistSchema } from "@/lib/definitions";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PlaylistCreator from "./components/PlaylistCreator";
import Header from "@/components/Header";

export type Playlist = {
  id: string;
  name: string;
  username: string;
  password: string;
  url: string;
  createdAt: Date;
};

export function PainelView() {
  const [open, setOpen] = useState(false);
  const storage = useStorage();

  const [playlists, setPlaylist] = useState<Playlist[] | null>(null);
  const form = useForm<z.infer<typeof PlaylistSchema>>({
    defaultValues: {
      name: "",
      username: "",
      password: "",
      url: "",
    },
    resolver: zodResolver(PlaylistSchema),
  });

  const gotoPlaylist = (id: string) => {
    window.location.href = `${import.meta.env.VITE_BASE_URL}playlist/${id}`;
  };

  useEffect(() => {
    if (!playlists) {
      const data = storage.get<Playlist[]>("user_playlist");
      if (data) {
        setPlaylist(data);
      }
    }
  }, [playlists]);

  return (
    <main className="h-screen">
      <Header
        options={{
          fixed: false,
          back: "/",
        }}
      />
      {playlists ? (
        <>
          <div className="container mx-auto py-5">
            <div className="mb-5 mt-10">
              <h1 className="text-4xl font-bold mb-2 mt-2">
                Todas as suas playlists em um só lugar
              </h1>
              <p className="text-xl text-zinc-500">
                Organizamos todas as suas playlists em um só lugar
              </p>
            </div>
            <div className="flex justify-start mb-5">
              <PlaylistCreator
                options={{
                  handlers: {
                    setOpen,
                    setPlaylist,
                  },
                  states: {
                    open,
                    playlists,
                  },
                  form,
                }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  role="button"
                  className="transition-all hover:bg-zinc-900/20 cursor-pointer"
                  onClick={() => {
                    gotoPlaylist(playlist.id);
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>{playlist.username[0]}</AvatarFallback>
                      </Avatar>
                      {playlist.name}
                    </CardTitle>
                    <CardDescription>{playlist.username}</CardDescription>
                  </CardHeader>
                  {/* <CardContent>
                  </CardContent> */}
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-screen place-items-center justify-center">
          <div className="flex flex-col gap-5">
            <section>
              <h1 className="text-4xl font-bold mb-2">
                Bem-vindo ao iPlayRight
              </h1>
              <p className="text-xl text-zinc-500">
                Parece que você ainda não tem nenhuma playlist... Vamos te
                ajudar!
              </p>
            </section>
            <section>
              <PlaylistCreator
                options={{
                  handlers: {
                    setOpen,
                    setPlaylist,
                  },
                  states: {
                    open,
                    playlists,
                  },
                  form,
                }}
              />
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
