import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import {
    DEFAULT_QUERY_SKIP,
    DEFAULT_QUERY_TAKE,
} from 'src/constants/query.constant';
import { PaginatedResponse } from 'src/types/paginated-response.type';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimelineService {
    constructor(private db: PrismaService) {}

    async timeline(currentUser: User, skip?: number, take?: number) {
        const whereCondition = {
            AND: [
                {
                    user: {
                        followed: {
                            every: { userFollowingId: currentUser.id },
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
            where: whereCondition,
            skip: !skip ? DEFAULT_QUERY_SKIP : Number(skip),
            take: !take ? DEFAULT_QUERY_TAKE : Number(take),
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                likesCount: true,
                repliesCount: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profile: {
                            select: {
                                displayName: true,
                                bio: true,
                                icon: true,
                            },
                        },
                    },
                },
            },
        });
        const count = await this.db.post.count({ where: whereCondition });
        return { count, result: timelinePosts } satisfies PaginatedResponse<
            typeof timelinePosts
        >;
    }
}
