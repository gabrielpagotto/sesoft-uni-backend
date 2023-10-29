import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Post as PostPersistence, User } from '@prisma/client';
import { omitObjectFields } from 'src/helpers/object.helper';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
    constructor(private db: PrismaService, private storage: StorageService) {}

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
                        profile: { select: { id: true, displayName: true } },
                    },
                },
                replies: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        updatedAt: true,
                        likesCount: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile: {
                                    select: { id: true, displayName: true },
                                },
                            },
                        },
                        likes: { where: { userId: currentUser.id } },
                    },
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
        return { ...object, replies, userLiked };
    }

    async create(
        files: Array<Express.Multer.File>,
        createPostDto: CreatePostDto,
        currentUser: User,
    ) {
        const uploadedFiles =
            this.storage.uploadFilesAndGetStorageRecords(files);
        // @TODO: Link the `uploadedFiles` with the post that will be created

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
}
