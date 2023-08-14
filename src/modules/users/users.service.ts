import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { DEFAULT_QUERY_SKIP, DEFAULT_QUERY_TAKE } from 'src/constants/query.constant';
import { PaginatedResponse } from 'src/types/paginated-response.type';

@Injectable()
export class UsersService {
    constructor(private db: PrismaService) { }

    async follow(id: string, currentUser: User) {
        if (id === currentUser.id) {
            throw new NotAcceptableException('User cannot follow himself')
        }
        const userToBeFollowed = await this.db.user.findUnique({ where: { id } });
        const userWhoWillFollow = await this.db.user.findUnique({ where: { id: currentUser.id } });
        if (!userToBeFollowed) {
            throw new NotFoundException('User not found');
        }
        const follow = await this.db.follow.findFirst({
            where: { AND: [{ userFollowedId: userToBeFollowed.id }, { userFollowingId: userWhoWillFollow.id }] }
        });
        if (follow) {
            throw new BadRequestException('Already follow')
        }
        const userToBeFollowedFollowersCount = userToBeFollowed.followersCount + 1;
        const userWhoWillFollowFollowersCount = userWhoWillFollow.followingsCount + 1;
        await this.db.follow.create({
            data: {
                userFollowedId: userToBeFollowed.id,
                userFollowingId: userWhoWillFollow.id
            }
        });
        await this.db.user.update({
            where: { id: userToBeFollowed.id },
            data: { followersCount: userToBeFollowedFollowersCount }
        });
        await this.db.user.update({
            where: { id: userWhoWillFollow.id },
            data: { followingsCount: userWhoWillFollowFollowersCount }
        });
        return { followed: true };
    }

    async unfollow(id: string, currentUser: User) {
        if (id === currentUser.id) {
            throw new NotAcceptableException('User cannot unfollow himself')
        }
        const userToBeUnfollowed = await this.db.user.findUnique({ where: { id } });
        const userWhoWillUnfollow = await this.db.user.findUnique({ where: { id: currentUser.id } });
        if (!userToBeUnfollowed) {
            throw new NotFoundException('User not found');
        }
        const follow = await this.db.follow.findFirst({
            where: { AND: [{ userFollowedId: userToBeUnfollowed.id }, { userFollowingId: userWhoWillUnfollow.id }] }
        });
        if (!follow) {
            throw new BadRequestException('No longer follows')
        }
        const userToBeUnfollowedFollowersCount = userToBeUnfollowed.followersCount - 1;
        const userWhoWillUnfollowFollowersCount = userWhoWillUnfollow.followingsCount - 1;
        await this.db.follow.deleteMany({
            where: {
                userFollowedId: userToBeUnfollowed.id,
                userFollowingId: userWhoWillUnfollow.id
            }
        });
        await this.db.user.update({
            where: { id: userToBeUnfollowed.id },
            data: { followersCount: userToBeUnfollowedFollowersCount }
        });
        await this.db.user.update({
            where: { id: userWhoWillUnfollow.id },
            data: { followingsCount: userWhoWillUnfollowFollowersCount }
        });
        return { unfollowed: true };
    }

    async followers(currentUser: User) {
        const followers = await this.db.follow.findMany({
            where: { userFollowedId: currentUser.id },
            include: {
                userFollowing: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profile: { select: { displayName: true, bio: true, icon: true } }
                    }
                }
            }
        });
        return followers.map(e => e.userFollowing);
    }

    async following(currentUser: User) {
        const following = await this.db.follow.findMany({
            where: { userFollowingId: currentUser.id },
            include: {
                userFollowed: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profile: { select: { displayName: true, bio: true, icon: true } }
                    }
                }
            }
        });
        return following.map(e => e.userFollowed);
    }

    async list(search?: string, skip?: number, take?: number) {
        const whereCondition = {
            OR: [
                { username: { contains: search } },
                { profile: { displayName: { contains: search } } }
            ]
        };
        const users = await this.db.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                email: true,
                username: true,
                profile: { select: { displayName: true, bio: true, icon: true } }
            },
            skip: !skip ? DEFAULT_QUERY_SKIP : Number(skip),
            take: !take ? DEFAULT_QUERY_TAKE : Number(take),
        });
        const count = await this.db.user.count({ where: whereCondition });
        return { count, result: users } satisfies PaginatedResponse<typeof users>;
    }
}
