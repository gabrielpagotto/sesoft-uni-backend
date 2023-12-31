import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { Post as PostPersistence, User } from '@prisma/client';
import { listPostSelector } from 'src/constants/selectors.constant';
import { omitObjectFields } from 'src/helpers/object.helper';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
    constructor(
        private db: PrismaService,
        private storage: StorageService,
        private socketGateway: SocketGateway,
    ) { }

    async findOne(id: string, currentUser: User) {
        if (!(await this.db.post.findUnique({ where: { id } }))) {
            throw new NotFoundException('Post not found');
        }
        const post = await this.db.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: { id: true, displayName: true, icon: true },
                        },
                    },
                },
                replies: {
                    select: listPostSelector,
                    orderBy: { createdAt: 'asc' },
                },
                likes: { where: { userId: currentUser.id } },
            },
        });
        const userLiked = post.likes.length > 0;

        const replies = post.replies.map((e) => {
            const postObj = { ...e, userLiked: e.likes.length > 0 };
            omitObjectFields(postObj, ['likes']);
            return postObj;
        });

        const object: any = omitObjectFields(post, ['likes', 'replies']);
        const files = await this.findFilesPost(post.id);

        return { ...object, replies, userLiked, files };
    }

    async create(
        files: Array<Express.Multer.File>,
        createPostDto: CreatePostDto,
        currentUser: User,
    ) {
        const user = await this.db.user.findUnique({
            where: { id: currentUser.id },
        });
        const post = await this.db.post.create({
            data: { ...createPostDto, userId: currentUser.id },
        });
        const postsCount = user.postsCount + 1;
        await this.db.user.update({
            where: { id: currentUser.id },
            data: { postsCount },
        });

        if (files) {
            const uploadedFiles =
                await this.storage.uploadFilesAndGetStorageRecords(files);

            post['files'] = [];
            for (const file of uploadedFiles) {
                await this.db.storagePost.create({
                    data: {
                        storageId: file.id,
                        postId: post.id,
                    },
                });

                post['files'].push({ url: file.url });
            }
        }
        this.socketGateway.sendEventToAll('new-post-created');
        return post;
    }

    async reply(
        createPostDto: CreatePostDto,
        currentUser: User,
        parentPostId: string,
    ) {
        const parentPost = await this.db.post.findUnique({
            where: { id: parentPostId },
        });
        if (!parentPost) {
            throw new NotFoundException('Post not found');
        }
        const user = await this.db.user.findUnique({
            where: { id: currentUser.id },
        });
        const post = await this.db.post.create({
            data: {
                ...createPostDto,
                userId: currentUser.id,
                postId: parentPostId,
            },
        });
        const postsCount = user.postsCount + 1;
        await this.db.user.update({
            where: { id: currentUser.id },
            data: { postsCount },
        });
        await this.db.post.update({
            where: { id: parentPostId },
            data: { repliesCount: parentPost.repliesCount + 1 },
        });
        this.socketGateway.sendEventToAll('new-post-created');
        return post;
    }

    async like(currentUser: User, id: string) {
        const post = await this.db.post.findUnique({ where: { id } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (
            await this.db.likes.findFirst({
                where: { AND: [{ postId: id }, { userId: currentUser.id }] },
            })
        ) {
            throw new BadRequestException(
                'The current user has already liked this post',
            );
        }
        await this.db.likes.create({
            data: { postId: id, userId: currentUser.id },
        });
        const user = await this.db.user.findUnique({
            where: { id: currentUser.id },
        });
        const postLikesCount = post.likesCount + 1;
        const userLikesCount = user.likesCount + 1;
        await this.db.post.update({
            where: { id },
            data: { likesCount: postLikesCount },
        });
        await this.db.user.update({
            where: { id: currentUser.id },
            data: { likesCount: userLikesCount },
        });
        return { liked: true };
    }

    async unlike(currentUser: User, id: string) {
        const post = await this.db.post.findUnique({ where: { id } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (
            !(await this.db.likes.findFirst({
                where: { AND: [{ postId: id }, { userId: currentUser.id }] },
            }))
        ) {
            throw new BadRequestException(
                'The current user dont liked this post',
            );
        }
        await this.db.likes.deleteMany({
            where: { AND: [{ postId: id }, { userId: currentUser.id }] },
        });
        const user = await this.db.user.findUnique({
            where: { id: currentUser.id },
        });
        const postLikesCount = post.likesCount - 1;
        const userLikesCount = user.likesCount - 1;
        await this.db.post.update({
            where: { id },
            data: { likesCount: postLikesCount },
        });
        await this.db.user.update({
            where: { id: currentUser.id },
            data: { likesCount: userLikesCount },
        });
        return { unliked: true };
    }

    async delete(currentUser: User, id: string): Promise<{ deleted: boolean }> {
        const post = await this.findPostById(id);

        this.checkPostOwnership(post, currentUser);

        await this.deletePost(id);

        const user = await this.db.user.findFirst({
            where: {
                id: currentUser.id,
            },
        });

        await this.db.user.update({
            data: {
                postsCount: user.postsCount - 1,
                likesCount: user.likesCount - post.likesCount,
            },
            where: {
                id: currentUser.id,
            },
        });

        return { deleted: true };
    }

    private async findPostById(id: string): Promise<PostPersistence> {
        const post = await this.db.post.findUnique({ where: { id } });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }

    private checkPostOwnership(post: PostPersistence, currentUser: User): void {
        if (post.userId !== currentUser.id) {
            throw new ForbiddenException(
                'Users cannot delete posts from other users.',
            );
        }
    }

    private async deletePost(id: string): Promise<void> {
        await this.db.post.delete({ where: { id } });
    }

    async userLikedPost(userId: string, postId: string): Promise<boolean> {
        const like = await this.db.likes.findFirst({
            where: {
                userId: userId,
                postId: postId,
            },
        });

        return !!like;
    }

    async findFilesPost(postId: string) {
        const files = await this.db.storagePost.findMany({
            select: {
                storage: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
            },
            where: {
                postId: postId,
            },
        });

        return files;
    }

    async findPostsLikedByUser(userId: string, currentUserId: string) {
        const likedPosts = await this.db.likes.findMany({
            where: {
                userId: userId,
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        icon: true,
                                    },
                                },
                            },
                        },
                        likes: {
                            where: { userId: userId },
                            orderBy: {
                                createdAt: 'asc',
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const posts = likedPosts.map((e) => e.post);

        for (let i = 0; i < posts.length; i++) {
            posts[i]['files'] = await this.findFilesPost(posts[i].id);

            posts[i]['liked'] = await this.userLikedPost(
                currentUserId,
                posts[i].id,
            );
        }

        return posts;
    }
}
