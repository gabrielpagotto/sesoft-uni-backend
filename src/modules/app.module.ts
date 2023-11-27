import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { NotificationsService } from './notifications/notifications.service';
import { PostsModule } from './posts/posts.module';
import { PrismaService } from './prisma/prisma.service';
import { ProfileModule } from './profile/profile.module';
import { SocketGateway } from './socket/socket.gateway';
import { SocketModule } from './socket/socket.module';
import { StorageService } from './storage/storage.service';
import { TimelineModule } from './timeline/timeline.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        AuthModule,
        SocketModule,
        PostsModule,
        UsersModule,
        TimelineModule,
        ProfileModule,
    ],
    controllers: [],
    providers: [
        PrismaService,
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        StorageService,
        NotificationsService,
        SocketGateway,
    ],
})
export class AppModule { }
