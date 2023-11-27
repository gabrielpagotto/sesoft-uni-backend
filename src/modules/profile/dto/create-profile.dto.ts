import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateProfileSchema = z.object({
    displayName: z.string(),
    bio: z.string(),
});

export class CreateProfileDto extends createZodDto(CreateProfileSchema) {
    displayName: string;
    bio: string;
}
