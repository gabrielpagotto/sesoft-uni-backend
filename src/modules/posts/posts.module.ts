import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { StorageService } from '../storage/storage.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
    controllers: [PostsController],
    providers: [PostsService, PrismaService, StorageService, SocketGateway],

})
export class PostsModule { }
