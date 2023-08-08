import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignupAuthSchema = z.object({
    displayName: z.string(),
    username: z.string(),
    email: z.string(),
    password: z.string(),
})

export class SignupAuthDto extends createZodDto(SignupAuthSchema) {
    @ApiProperty()
    readonly displayName: string
    @ApiProperty()
    readonly username: string
    @ApiProperty()
    readonly email: string
    @ApiProperty()
    readonly password: string
}
