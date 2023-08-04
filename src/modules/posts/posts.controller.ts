import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('posts')
@UseGuards(JwtGuard)
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id)
    }

    @Post()
    create(@Body() createPostDto: CreatePostDto, @CurrentUser() currentUser: User) {
        return this.postsService.create(createPostDto, currentUser)
    }

    @Post(':id/reply')
    reply(@Body() createPostDto: CreatePostDto, @CurrentUser() currentUser: User, @Param('id') id: string) {
        return this.postsService.reply(createPostDto, currentUser, id)
    }

    @Post(':id/like')
    @HttpCode(HttpStatus.OK)
    like(@CurrentUser() currentUser: User, @Param('id') id: string) {
        return this.postsService.like(currentUser, id)
    }

    @Post(':id/unlike')
    @HttpCode(HttpStatus.OK)
    unlike(@CurrentUser() currentUser: User, @Param('id') id: string) {
        return this.postsService.unlike(currentUser, id)
    }
}