import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/guards/jwt.guard';
import { ApiResponse } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post(':id/follow')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Segue um usuário específico.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'O usuário não pode seguir ele mesmo.\t\n Usuário já é seguido' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
    follow(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.follow(id, currentUser);
    }

    @Post(':id/unfollow')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Deixa de seguir um usuário específico.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'O usuário não pode deixar de seguir ele mesmo.\t\n Usuário não segue ainda'
    })
    unfollow(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.unfollow(id, currentUser);
    }

    @Get('me/followers')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Busca os seguidores do usuário logado.' })
    followers(@CurrentUser() currentUser: User, @Query('skip') skip?: number, @Query('take') take?: number) {
        return this.usersService.followers(currentUser, skip, take);
    }

    @Get('me/following')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Busca os usuários que o usuário logado segue.' })
    following(@CurrentUser() currentUser: User, @Query('skip') skip?: number, @Query('take') take?: number) {
        return this.usersService.following(currentUser, skip, take);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    list(@Query('search') search?: string, @Query('skip') skip?: number, @Query('take') take?: number) {
        return this.usersService.list(search, skip, take);
    }
}
