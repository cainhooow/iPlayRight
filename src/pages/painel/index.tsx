import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useStorage } from "@/hooks/storage";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlaylistSchema } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  generatePlaylistId,
  generateUserAccessKey,
  hashText,
} from "@/utils/iid";

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
  const playlistStorage = useStorage<Playlist[]>();
  const keyStorage = useStorage<string>();

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

  const addPlaylist = async (values: z.infer<typeof PlaylistSchema>) => {
    if (!playlists) {
      keyStorage.set(`iikey`, generateUserAccessKey());
      const key = keyStorage.get(`iikey`) as string;
      const password = await hashText(values.password, key);
      
      const newItem: Playlist = {
        ...values,
        id: generatePlaylistId(),
        createdAt: new Date(),
        password: password,
      };
      
      setPlaylist([newItem]);
      playlistStorage.set("user_playlist", [newItem]);
      form.reset();
      setOpen(false);
      return;
    }
  
    if (playlists.find((playlist) => playlist.username === values.username)) {
      return;
    }

    if (!keyStorage.get(`iikey`)) {
      keyStorage.set(`iikey`, generateUserAccessKey());
    }

    const key = keyStorage.get(`iikey`) as string;
    const password = await hashText(values.password, key);

    const newItem = {
      ...values,
      id: generatePlaylistId(),
      createdAt: new Date(),
      password: password,
    };

    setPlaylist([...playlists, newItem]);
    playlistStorage.set("user_playlist", [...playlists, newItem]);
    form.reset();
    setOpen(false);
  };

  const gotoPlaylist = (id: string) => {
    window.location.href = `/playlist/${id}`;
  };

  useEffect(() => {
    if (!playlists) {
      const data = playlistStorage.get("user_playlist");
      if (data) {
        setPlaylist(data);
      }
    }
  }, [playlists]);

  return (
    <main className="h-screen">
      <header className="bg-zinc-900/20">
        <div className="flex container mx-auto py-5">
          <div className="">
            <h1 className="text-4xl font-bold">iPlayRight</h1>
          </div>
        </div>
      </header>
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
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger>
                  <Button
                    className="w-full flex transition-all"
                    size={"lg"}
                    variant="secondary"
                  >
                    <PlusIcon /> Adicionar playlist
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Criar nova playlist</AlertDialogTitle>
                    <AlertDialogDescription>
                      Organize suas streams em playlists e acesse de forma
                      rápida
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(addPlaylist)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da playlist</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Nome da playlist"
                              />
                            </FormControl>
                            <FormDescription>
                              Nome que será usado para identificar a playlist
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuário</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Nome de usuário"
                              />
                            </FormControl>
                            <FormDescription>
                              Nome de usuário que será usado para acessar a
                              lista de streams
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Senha"
                              />
                            </FormControl>
                            <FormDescription>
                              Senha que será usada para acessar a lista de streams
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Url</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="http://mediaserver.io:{port}"
                              />
                            </FormControl>
                            <FormDescription>
                              Url do servidor de mídia compativel
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <Button type="submit" variant="secondary">
                          Confirmar
                        </Button>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  role="button"
                  className="transition-all hover:bg-zinc-900/20 cursor-pointer"
                  onClick={
                    () => {
                      gotoPlaylist(playlist.id);
                    }
                  }
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
              <AlertDialog>
                <AlertDialogTrigger className="w-full">
                  <Button
                    className="w-full flex transition-all"
                    size={"lg"}
                    variant="secondary"
                  >
                    <PlusIcon /> Adicionar playlist
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Criar nova playlist</AlertDialogTitle>
                    <AlertDialogDescription>
                      Organize suas streams em playlists e acesse de forma
                      rápida
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(addPlaylist)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da playlist</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Nome da playlist"
                              />
                            </FormControl>
                            <FormDescription>
                              Nome que será usado para identificar a playlist
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuário</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Nome de usuário"
                              />
                            </FormControl>
                            <FormDescription>
                              Nome de usuário que será usado para acessar a
                              lista de streams
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Senha"
                              />
                            </FormControl>
                            <FormDescription>
                              Senha que será usada para acessar a lista de
                              streams
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Url</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="http://mediaserver.io:{port}"
                              />
                            </FormControl>
                            <FormDescription>
                              Url do servidor de mídia compativel
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <Button variant="secondary">Confirmar</Button>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}