import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import {
    DEFAULT_QUERY_SKIP,
    DEFAULT_QUERY_TAKE,
} from 'src/constants/query.constant';
import { listPostSelector } from 'src/constants/selectors.constant';
import { PaginatedResponse } from 'src/types/paginated-response.type';
import { PostsService } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimelineService {
    constructor(
        private readonly db: PrismaService,
        private readonly postService: PostsService,
    ) { }

    async timeline(currentUser: User, skip?: number, take?: number) {
        const whereCondition = {
            AND: [
                {
                    user: {
                        followed: {
                            some: { userFollowingId: currentUser.id },
                        },
                    },
                },
                {
                    postId: null,
                },
            ],
        };
        const timelinePosts = await this.db.post.findMany({
            orderBy: { createdAt: 'desc' },
            where: {
                AND: [
                    {
                        user: {
                            followed: {
                                some: { userFollowingId: currentUser.id },
                            },
                        },
                    },
                    {
                        postId: null,
                    },
                ],
            },
            skip: !skip ? DEFAULT_QUERY_SKIP : Number(skip),
            take: !take ? DEFAULT_QUERY_TAKE : Number(take),
            select: listPostSelector,
        });

        // @TODO Refatorar.
        const posts = [];
        for (const post of timelinePosts) {
            const liked = await this.postService.userLikedPost(
                currentUser.id,
                post.id,
            );
            const files = await this.postService.findFilesPost(post.id);
            posts.push({ ...post, liked, files });
        }

        const count = await this.db.post.count({ where: whereCondition });
        return { count, result: posts } satisfies PaginatedResponse<
            typeof posts
        >;
    }
}
