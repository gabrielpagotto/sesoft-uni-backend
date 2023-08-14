import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('timeline')
@UseGuards(JwtGuard)
export class TimelineController {
    constructor(private readonly timelineService: TimelineService) { }

    @Get()
    timeline(@CurrentUser() currentUser: User, @Query('skip') skip?: number, @Query('take') take?: number) {
        return this.timelineService.timeline(currentUser, skip, take);
    }
}
