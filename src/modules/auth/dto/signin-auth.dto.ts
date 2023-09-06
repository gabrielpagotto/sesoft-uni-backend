import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SigninAuthSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class SigninAuthDto extends createZodDto(SigninAuthSchema) {
    @ApiProperty()
    readonly email: string;
    @ApiProperty()
    readonly password: string;
}
