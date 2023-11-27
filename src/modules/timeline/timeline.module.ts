import { Module } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { StorageService } from '../storage/storage.service';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
    controllers: [TimelineController],
    providers: [TimelineService, PrismaService, PostsService, StorageService, SocketGateway],
})
export class TimelineModule { }
