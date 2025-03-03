import { Stream } from "@/types/Stream";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Category } from "@/types/Category";
import { Playlist } from "@/types/Playlist";

export default function LiveCard({
  orientation,
  stream,
  categories,
  playlist,
}: {
  orientation: "vertical" | "horizontal";
  stream: Stream;
  categories: Category[];
  playlist: Playlist;
}) {
  function goLive(stream: Stream) {
    window.location.href = `/playlist/${playlist?.id}/live-streams/${stream.stream_id}`;
  }

  return (
    <div
      className="m-2 cursor-pointer"
      role="button"
      onClick={() => goLive(stream)}
    >
      <div
        className={`${
          orientation === "vertical" ? "mb-2" : "grid grid-cols-2 gap-5"
        }`}
      >
        <div className="mb-2">
          <img
            className={`rounded-lg bg-zinc-900 ${
              orientation === "vertical" ? "h-[250px]" : "h-[150px]"
            } ${
              orientation === "vertical" ? "w-full" : "w-[150px]"
            }  w-full object-contain`}
            src={stream.stream_icon}
            alt={stream.name}
          />
        </div>
        <div
          className={`${
            orientation === "vertical" ? "flex gap-3" : "flex gap-3 flex-col"
          }`}
        >
          <div className={`${orientation === "horizontal" ? "hidden" : ""}`}>
            <div className="flex">
              <Avatar>
                <AvatarFallback>
                  {stream.name ? stream.name.charAt(0) : "S"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <h1 className="text-1xl font-bold text-zinc-300">{stream.name}</h1>
            <div className="text-xs mt-2 text-zinc-300">
              <span>
                {
                  categories?.find(
                    (cat) => stream.category_id === cat.category_id
                  )?.category_name
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
