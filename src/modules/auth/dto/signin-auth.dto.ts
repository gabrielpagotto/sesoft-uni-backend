import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SigninAuthSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export class SigninAuthDto extends createZodDto(SigninAuthSchema) {
    email: string
    password: string
}
