import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService, PrismaService, StorageService],
})
export class UsersModule {}
