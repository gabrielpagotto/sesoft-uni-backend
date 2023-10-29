import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('find/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post(':id/follow')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Segue um usuário específico.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description:
            'O usuário não pode seguir ele mesmo.\t\n Usuário já é seguido',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    follow(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.follow(id, currentUser);
    }

    @Post(':id/unfollow')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Deixa de seguir um usuário específico.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description:
            'O usuário não pode deixar de seguir ele mesmo.\t\n Usuário não segue ainda',
    })
    unfollow(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.unfollow(id, currentUser);
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    me(@CurrentUser() currentUser: User) {
        return this.usersService.me(currentUser);
    }

    @Get('me/followers')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Busca os seguidores do usuário logado.',
    })
    followers(
        @CurrentUser() currentUser: User,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        return this.usersService.followers(currentUser, skip, take);
    }

    @Get('me/following')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Busca os usuários que o usuário logado segue.',
    })
    following(
        @CurrentUser() currentUser: User,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        return this.usersService.following(currentUser, skip, take);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    list(
        @Query('search') search?: string,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        return this.usersService.list(search, skip, take);
    }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Foto de perfil criada com sucesso.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Foto de usuário inválida',
    })
    @UseInterceptors(FileInterceptor('file'))
    upload(
        @CurrentUser() currentUser: User,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.usersService.uploadProfilePicture(currentUser, file);
    }
}
