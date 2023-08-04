import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreatePostSchema = z.object({
    content: z.string(),
})

export class CreatePostDto extends createZodDto(CreatePostSchema) {
    content: string
}
