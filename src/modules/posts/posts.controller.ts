import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@UseGuards(JwtGuard)
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Get(':id')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Busca postagem pelo ID.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Postagem não encontrada.',
    })
    findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
        return this.postsService.findOne(id, currentUser);
    }

    @Post()
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cria uma nova postagem.',
    })
    @UseInterceptors(FilesInterceptor('files'))
    create(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() createPostDto: CreatePostDto,
        @CurrentUser() currentUser: User,
    ) {
        return this.postsService.create(files, createPostDto, currentUser);
    }

    @Post(':id/reply')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cria uma nova postagem para responder outra postagem.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Postagem não encontrada.',
    })
    reply(
        @Body() createPostDto: CreatePostDto,
        @CurrentUser() currentUser: User,
        @Param('id') id: string,
    ) {
        return this.postsService.reply(createPostDto, currentUser, id);
    }

    @Post(':id/like')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Curti uma postagem específica.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'O usuário já curtiu esta postagem.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Usuário não pode descurtir sua prórpia postagem.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Postagem não encontrada.',
    })
    like(@CurrentUser() currentUser: User, @Param('id') id: string) {
        return this.postsService.like(currentUser, id);
    }

    @Post(':id/unlike')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Descurti uma postagem específica.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'O usuário não curtiu esta postagem.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Postagem não encontrada.',
    })
    unlike(@CurrentUser() currentUser: User, @Param('id') id: string) {
        return this.postsService.unlike(currentUser, id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Apaga uma postagem específica.',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Usuário não pode apagar essa publicação.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Postagem não encontrada.',
    })
    remove(@CurrentUser() currentUser: User, @Param('id') id: string) {
        return this.postsService.delete(currentUser, id);
    }
}
