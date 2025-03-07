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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStorage } from "@/hooks/storage";
import { PlaylistSchema } from "@/lib/definitions";
import { Playlist } from "@/types/Playlist";
import {
  generatePlaylistId,
  generateUserAccessKey,
  hashText,
} from "@/utils/iid";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type States = {
  open: boolean;
  playlists: Playlist[] | null;
};

type Handlers = {
  setOpen: (value: boolean) => void;
  setPlaylist: (value: Playlist[] | null) => void;
};

type DefaultForm = ReturnType<typeof useForm<z.infer<typeof PlaylistSchema>>>;

type Options = {
  handlers: Handlers;
  states: States;
  form: DefaultForm;
};

export default function PlaylistCreator({ options }: { options: Options }) {
  const storage = useStorage();

  const addPlaylist = async (values: z.infer<typeof PlaylistSchema>) => {
    if (!options.states.playlists) {
      storage.set(`iikey`, generateUserAccessKey());
      const key = storage.get<string>(`iikey`) as string;
      const password = await hashText(values.password, key);

      const newItem: Playlist = {
        ...values,
        id: generatePlaylistId(),
        createdAt: new Date(),
        password: password,
      };

      options.handlers.setPlaylist([newItem]);
      storage.set("user_playlist", [newItem]);

      options.form.reset();
      options.handlers.setOpen(false);
      return;
    }

    if (
      options.states.playlists.find(
        (playlist) => playlist.username === values.username
      )
    ) {
      return;
    }

    if (!storage.get<string>(`iikey`)) {
      storage.set(`iikey`, generateUserAccessKey());
    }

    const key = storage.get<string>(`iikey`) as string;
    const password = await hashText(values.password, key);

    const newItem = {
      ...values,
      id: generatePlaylistId(),
      createdAt: new Date(),
      password: password,
    };

    options.handlers.setPlaylist([...options.states.playlists, newItem]);

    storage.set("user_playlist", [
      ...options.states.playlists,
      newItem,
    ]);
    
    options.form.reset();
    options.handlers.setOpen(false);
  };

  return (
    <AlertDialog
      open={options.states.open}
      onOpenChange={options.handlers.setOpen}
    >
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
            Organize suas streams em playlists e acesse de forma rápida
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...options.form}>
          <form
            onSubmit={options.form.handleSubmit(addPlaylist)}
            className="space-y-4"
          >
            <FormField
              control={options.form.control}
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
              control={options.form.control}
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
                    Nome de usuário que será usado para acessar a lista de
                    streams
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={options.form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Senha" />
                  </FormControl>
                  <FormDescription>
                    Senha que será usada para acessar a lista de streams
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={options.form.control}
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
  );
}
