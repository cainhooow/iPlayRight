import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { LucideArrowLeft, LucideSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Playlist } from "@/types/Playlist";

type SearchTypes = "redirect" | "handle";

type SearchHandlers = {
  searchType: SearchTypes;
  searchText: string;
  setSearchText: (value: string) => void;
  handleSearch: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

type HeaderOptions = {
  fixed: boolean;
  back: string;
  search?: SearchHandlers;
  playlist?: Playlist;
};

export default function Header({ options }: { options: HeaderOptions }) {
  function searchHandler(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!options.search || !options.playlist) return;
    if (options.search.searchType === "handle") {
      options.search.handleSearch(ev);
      return;
    }

    window.location.href = `${import.meta.env.VITE_BASE_URL}playlist/${
      options.playlist.id
    }/live-streams?q=${encodeURIComponent(options.search.searchText)}`;
  }

  return (
    <header
      className={`${
        options.fixed && "fixed left-0 top-0 right-0"
      } bg-background backdrop-blur-md border-b border-b-zinc-900 z-40`}
    >
      <div className="grid grid-cols-3 container mx-auto py-5">
        <div className="flex items-center gap-5">
          <div>
            <Link to={options.back} prefetch="render">
              <Button variant="ghost" size={"icon"}>
                <LucideArrowLeft />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">iPlayRight</h1>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative flex w-full">
            {options.search && (
              <>
                <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                  <LucideSearch className="h-4 w-4" />
                </div>
                <Input
                  className="pl-8 rounded-r-none transition-all"
                  placeholder="Buscar"
                  onChange={(ev) =>
                    options.search?.setSearchText(ev.target.value)
                  }
                  id="search"
                />
                <Button
                  className="transition-all rounded-l-none px-5"
                  onClick={searchHandler}
                  variant="outline"
                  size={"icon"}
                >
                  <LucideSearch />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
