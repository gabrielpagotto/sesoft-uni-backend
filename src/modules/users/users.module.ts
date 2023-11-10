import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service';
import { PostsService } from '../posts/posts.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService, PrismaService, StorageService, PostsService],
})
export class UsersModule {}
