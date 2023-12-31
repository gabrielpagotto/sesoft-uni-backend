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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { PostsService } from '../posts/posts.service';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly postService: PostsService,
    ) { }

    @Get('find/:id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    findById(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.findById(id, currentUser);
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

    @Get(':id/followers')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Busca os seguidores do usuário especificado pelo id.',
    })
    followersUsersById(
        @Param('id') id: string,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        return this.usersService.followersUsersById(id, skip, take);
    }

    @Get(':id/following')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description:
            'Busca os usuários que o usuário especificado pelo id segue.',
    })
    followingUsersById(
        @Param('id') id: string,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        return this.usersService.followingUsersById(id, skip, take);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    list(
        @CurrentUser() currentUser: User,
        @Query('search') search?: string,
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ) {
        return this.usersService.list(currentUser, search, skip, take);
    }

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Foto de perfil criada com sucesso.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Arquivo não encontrado.',
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

    @Get(':id/posts')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    userPosts(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.usersService.findUserPosts(id, currentUser.id);
    }

    @Get(':id/posts/liked')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Usuário não encontrado.',
    })
    userLiked(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.postService.findPostsLikedByUser(id, currentUser.id);
    }
}
