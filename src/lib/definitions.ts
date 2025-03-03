import { z } from "zod";

export const PlaylistSchema = z.object({
    name: z.string().min(5, { message: "O nome da playlist deve ter ao minimo 5 caracteres" }),
    username: z.string().min(5, { message: "O nome do usuario deve ter ao minimo 5 caracteres" }),
    password: z.string().min(5, { message: "A senha deve ter ao minimo 5 caracteres" }),
    url: z.string().url({ message: "A url deve ser valida" }),
})