import { Module } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [TimelineController],
    providers: [TimelineService, PrismaService]
})
export class TimelineModule { }
