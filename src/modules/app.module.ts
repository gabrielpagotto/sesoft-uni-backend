import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { PostsModule } from './posts/posts.module';

@Module({
    imports: [AuthModule, PostsModule],
    controllers: [],
    providers: [
        PrismaService,
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        }
    ],
})
export class AppModule { }
