import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
    controllers: [TimelineController],
    providers: [TimelineService, PrismaService],
})
export class TimelineModule {}
