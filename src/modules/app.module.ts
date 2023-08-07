import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { TimelineModule } from './timeline/timeline.module';

@Module({
    imports: [AuthModule, PostsModule, UsersModule, TimelineModule],
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
