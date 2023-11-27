import { Module } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { SocketModule } from '../socket/socket.module';
import { StorageService } from '../storage/storage.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [SocketModule],
    controllers: [UsersController],
    providers: [UsersService, PrismaService, StorageService, PostsService, SocketGateway],

})
export class UsersModule { }
