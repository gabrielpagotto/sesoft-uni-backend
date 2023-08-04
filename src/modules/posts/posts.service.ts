import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
    constructor(private db: PrismaService) { }

    async findOne(id: string) {
        if (!(await this.db.post.findUnique({ where: { id } }))) {
            throw new NotFoundException("Post not found")
        }
        return this.db.post.findUnique({
            where: { id }, include: {
                user: true,
                replies: true,
            }
        });
    }

    async create(createPostDto: CreatePostDto, currentUser: User) {
        const post = await this.db.post.create({ data: { ...createPostDto, userId: currentUser.id } });
        const user = await this.db.user.findUnique({ where: { id: currentUser.id } });
        const postsCount = user.postsCount + 1;
        await this.db.user.update({ where: { id: currentUser.id }, data: { postsCount } });
        return post
    }

    async reply(createPostDto: CreatePostDto, currentUser: User, parentPostId: string) {
        if (!(await this.db.post.findUnique({ where: { id: parentPostId } }))) {
            throw new NotFoundException("Post not found")
        }
        const post = await this.db.post.create({
            data: { ...createPostDto, userId: currentUser.id, postId: parentPostId }
        });
        const user = await this.db.user.findUnique({ where: { id: currentUser.id } });
        const postsCount = user.postsCount + 1;
        await this.db.user.update({ where: { id: currentUser.id }, data: { postsCount } });
        return post
    }

    async like(currentUser: User, id: string) {
        const post = await this.db.post.findUnique({ where: { id } });
        if (!post) {
            throw new NotFoundException("Post not found");
        }
        if (await this.db.likes.findFirst({ where: { AND: [{ postId: id }, { userId: currentUser.id }] } })) {
            throw new BadRequestException("The current user has already liked this post");
        }
        await this.db.likes.create({ data: { postId: id, userId: currentUser.id } });
        const likesCount = post.likesCount + 1;
        await this.db.post.update({ where: { id }, data: { likesCount } });
        return { liked: true };
    }

    async unlike(currentUser: User, id: string) {
        const post = await this.db.post.findUnique({ where: { id } });
        if (!post) {
            throw new NotFoundException("Post not found");
        }
        if (!(await this.db.likes.findFirst({ where: { AND: [{ postId: id }, { userId: currentUser.id }] } }))) {
            throw new BadRequestException("The current user dont liked this post");
        }
        await this.db.likes.deleteMany({
            where: { AND: [{ postId: id }, { userId: currentUser.id }] }
        });
        const likesCount = post.likesCount - 1;
        await this.db.post.update({ where: { id }, data: { likesCount } });
        return { unliked: true };
    }
}