import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { omitObjectFields } from 'src/helpers/object.helper';

@Injectable()
export class PostsService {
    constructor(private db: PrismaService) { }

    async findOne(id: string, currentUser: User) {
        if (!(await this.db.post.findUnique({ where: { id } }))) {
            throw new NotFoundException("Post not found")
        }
        const post = await this.db.post.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, username: true }, include: {} },
                replies: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        updatedAt: true,
                        likesCount: true,
                        user: { select: { id: true, firstName: true, lastName: true, username: true } },
                        likes: { where: { userId: currentUser.id } }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                likes: { where: { userId: currentUser.id } }
            },
        });
        const userLiked = post.likes.length > 0;
        const replies = post.replies.map(e => {
            const postObj = { ...e, userLiked: e.likes.length > 0 };
            omitObjectFields(postObj, ['likes']);
            return postObj;
        })
        const object: any = omitObjectFields(post, ['likes', 'replies']);
        return { ...object, replies, userLiked };
    }

    async create(createPostDto: CreatePostDto, currentUser: User) {
        const post = await this.db.post.create({ data: { ...createPostDto, userId: currentUser.id } });
        const postsCount = currentUser.postsCount + 1;
        await this.db.user.update({ where: { id: currentUser.id }, data: { postsCount } });
        return post;
    }

    async reply(createPostDto: CreatePostDto, currentUser: User, parentPostId: string) {
        if (!(await this.db.post.findUnique({ where: { id: parentPostId } }))) {
            throw new NotFoundException("Post not found")
        }
        const post = await this.db.post.create({
            data: { ...createPostDto, userId: currentUser.id, postId: parentPostId }
        });
        const postsCount = currentUser.postsCount + 1;
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
        const user = await this.db.user.findUnique({ where: { id: currentUser.id } });
        const postLikesCount = post.likesCount + 1;
        const userLikesCount = user.likesCount + 1;
        await this.db.post.update({ where: { id }, data: { likesCount: postLikesCount } });
        await this.db.user.update({ where: { id: currentUser.id }, data: { likesCount: userLikesCount } });
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
        const user = await this.db.user.findUnique({ where: { id: currentUser.id } });
        const postLikesCount = post.likesCount - 1;
        const userLikesCount = user.likesCount - 1;
        await this.db.post.update({ where: { id }, data: { likesCount: postLikesCount } });
        await this.db.user.update({ where: { id: currentUser.id }, data: { likesCount: userLikesCount } });
        return { unliked: true };
    }
}
