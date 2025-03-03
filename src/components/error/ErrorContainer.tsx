import {
  LucideContact,
  LucideGlobe,
  LucideInfo,
  LucideServer,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

export default function ErrorContainer({ error }: { error: string }) {
  return (
    <div className="relative h-screen">
      <div className="flex w-full h-full items-center">
        <div className="flex justify-center gap-5">
          <div className="flex flex-col w-2/5 border-r pr-4">
            <div className="mb-3">
              <h1 className="text-5xl font-bold">Ocorreu um erro</h1>
            </div>
            <div className="mb-5">
              <p className="text-xl text-zinc-400">
                Parece que ocorreu algum erro durante algum processo da página,
                mas não se preocupe, esta mensagem é apenas para informa-lo do
                possivel erro.
              </p>
            </div>
            <Alert>
              <LucideInfo />
              <AlertTitle>Erro!</AlertTitle>
              <AlertDescription className="text-rose-200">
                {error}
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex flex-col w-2/5">
            <div className="mb-3">
              <p className="text-xl mb-4">
                Para te ajudar, daremos a opção de tentar recarregar a página
                novamente e caso não funcione, tente:
              </p>
              <ul className="text-zinc-500 space-y-2">
                <li className="flex gap-2 items-center">
                  <LucideGlobe size={18} /> - Verificar o acesso a internet
                </li>
                <li className="flex gap-2 items-center">
                  <LucideServer size={18} /> - Verificar os servidores DNS
                </li>
                <li className="flex gap-2 items-center">
                  <LucideContact size={18} /> - Informar o erro ao suporte
                </li>
              </ul>
            </div>
            <div className="mb-3 w-full space-x-3">
              <Button
                className="transition-all"
                variant="link"
                onClick={() => window.location.reload()}
              >
                Recarregar
              </Button>
              <a href="/painel">
                <Button className="transition-all" variant="link">
                  Voltar a página inicial
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
