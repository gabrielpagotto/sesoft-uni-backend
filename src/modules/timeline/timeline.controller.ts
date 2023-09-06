import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { TimelineService } from './timeline.service';

@Controller('timeline')
@UseGuards(JwtGuard)
export class TimelineController {
    constructor(private readonly timelineService: TimelineService) {}

    @Get()
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Realiza a montagem da timeline do usuário atual.',
    })
    timeline(
        @CurrentUser() currentUser: User,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        return this.timelineService.timeline(currentUser, skip, take);
    }
}
