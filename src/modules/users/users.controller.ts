import { Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post(':id/follow')
    @HttpCode(HttpStatus.OK)
    follow(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.follow(id, currentUser)
    }

    @Post(':id/unfollow')
    @HttpCode(HttpStatus.OK)
    unfollow(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.unfollow(id, currentUser)
    }
}
