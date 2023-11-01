import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { PostsService } from '../posts/posts.service';
import { StorageService } from '../storage/storage.service';

@Module({
    controllers: [TimelineController],
    providers: [TimelineService, PrismaService, PostsService, StorageService],
})
export class TimelineModule {}
