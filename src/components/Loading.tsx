import React from "react";
import { useLoading } from "@/hooks/loading";
import {
  LucideLoaderCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Loading({ children }: { children: React.ReactNode }) {
  const { loading } = useLoading();
  const [tip, setTip] = React.useState(0);
  const [showReloading, setShowReloading] = React.useState(false);

  const tips = [
    "Esperar as vezes é necessario!",
    "Preparando um ambiente seguro!",
    "Se necessário, recarregue a página!",
  ];

  React.useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setTip((prev) => (prev + 1) % tips.length);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  React.useEffect(() => {
    const maxLoadingAwait = 10000;
    if (loading) {
      setTimeout(() => {
        setShowReloading(true);
      }, maxLoadingAwait);
    }

    return () => {
      setShowReloading(false);
    };
  }, [loading]);

  return (
    <>
      {loading && (
        <>
          <div className="fixed top-0 bottom-0 left-0 right-0 bg-background z-[99] h-screen"></div>
          <div className="fixed flex h-screen w-full items-center justify-center z-[99]">
            <div className="absolute top-0 w-full flex justify-center p-5">
              {showReloading && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size={"icon"}
                >
                  <RotateCcw size={25} />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center gap-5">
                <LucideLoaderCircle
                  className="animate-spin text-zinc-600"
                  size={50}
                />
                <h1 className="text-3xl text-zinc-300">Carregando</h1> -
              </div>
              <span className="text-center">{tips[tip]}</span>
            </div>
          </div>
        </>
      )}
      {children}
    </>
  );
}
