import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignupAuthSchema = z.object({
    displayName: z.string(),
    username: z.string(),
    email: z.string(),
    password: z.string(),
})

export class SignupAuthDto extends createZodDto(SignupAuthSchema) {
    displayName: string
    username: string
    email: string
    password: string
}
