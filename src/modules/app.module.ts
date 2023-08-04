import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';

@Module({
    imports: [AuthModule],
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
