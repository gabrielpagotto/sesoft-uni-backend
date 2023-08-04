import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignupAuthSchema = z.object({
    firstName: z.string(),
    lastName: z.string().nullable(),
    username: z.string(),
    email: z.string(),
    password: z.string(),
})

export class SignupAuthDto extends createZodDto(SignupAuthSchema) {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
}
