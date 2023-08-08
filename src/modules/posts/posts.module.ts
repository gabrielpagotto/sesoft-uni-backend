import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Module({
    controllers: [PostsController],
    providers: [PostsService, PrismaService, StorageService],
})
export class PostsModule { }
