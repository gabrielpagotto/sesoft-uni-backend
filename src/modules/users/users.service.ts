import {
    BadRequestException,
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import {
    DEFAULT_QUERY_SKIP,
    DEFAULT_QUERY_TAKE,
} from 'src/constants/query.constant';
import { PaginatedResponse } from 'src/types/paginated-response.type';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
    constructor(
        private db: PrismaService,
        private readonly storage: StorageService,
    ) {}

    async findById(id: string) {
        const user = await this.db.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                likesCount: true,
                postsCount: true,
                followingsCount: true,
                followersCount: true,
                profile: {
                    include: { icon: true },
                },
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async follow(id: string, currentUser: User) {
        if (id === currentUser.id) {
            throw new NotAcceptableException('User cannot follow himself');
        }
        const userToBeFollowed = await this.db.user.findUnique({
            where: { id },
        });
        const userWhoWillFollow = await this.db.user.findUnique({
            where: { id: currentUser.id },
        });
        if (!userToBeFollowed) {
            throw new NotFoundException('User not found');
        }
        const follow = await this.db.follow.findFirst({
            where: {
                AND: [
                    { userFollowedId: userToBeFollowed.id },
                    { userFollowingId: userWhoWillFollow.id },
                ],
            },
        });
        if (follow) {
            throw new BadRequestException('Already follow');
        }
        const userToBeFollowedFollowersCount =
            userToBeFollowed.followersCount + 1;
        const userWhoWillFollowFollowersCount =
            userWhoWillFollow.followingsCount + 1;
        await this.db.follow.create({
            data: {
                userFollowedId: userToBeFollowed.id,
                userFollowingId: userWhoWillFollow.id,
            },
        });
        await this.db.user.update({
            where: { id: userToBeFollowed.id },
            data: { followersCount: userToBeFollowedFollowersCount },
        });
        await this.db.user.update({
            where: { id: userWhoWillFollow.id },
            data: { followingsCount: userWhoWillFollowFollowersCount },
        });
        return { followed: true };
    }

    async unfollow(id: string, currentUser: User) {
        if (id === currentUser.id) {
            throw new NotAcceptableException('User cannot unfollow himself');
        }
        const userToBeUnfollowed = await this.db.user.findUnique({
            where: { id },
        });
        const userWhoWillUnfollow = await this.db.user.findUnique({
            where: { id: currentUser.id },
        });
        if (!userToBeUnfollowed) {
            throw new NotFoundException('User not found');
        }
        const follow = await this.db.follow.findFirst({
            where: {
                AND: [
                    { userFollowedId: userToBeUnfollowed.id },
                    { userFollowingId: userWhoWillUnfollow.id },
                ],
            },
        });
        if (!follow) {
            throw new BadRequestException('No longer follows');
        }
        const userToBeUnfollowedFollowersCount =
            userToBeUnfollowed.followersCount - 1;
        const userWhoWillUnfollowFollowersCount =
            userWhoWillUnfollow.followingsCount - 1;
        await this.db.follow.deleteMany({
            where: {
                userFollowedId: userToBeUnfollowed.id,
                userFollowingId: userWhoWillUnfollow.id,
            },
        });
        await this.db.user.update({
            where: { id: userToBeUnfollowed.id },
            data: { followersCount: userToBeUnfollowedFollowersCount },
        });
        await this.db.user.update({
            where: { id: userWhoWillUnfollow.id },
            data: { followingsCount: userWhoWillUnfollowFollowersCount },
        });
        return { unfollowed: true };
    }

    async followers(currentUser: User, skip?: number, take?: number) {
        const whereCondition = { userFollowedId: currentUser.id };
        const followers = await this.db.follow.findMany({
            where: whereCondition,
            skip: !skip ? DEFAULT_QUERY_SKIP : Number(skip),
            take: !take ? DEFAULT_QUERY_TAKE : Number(take),
            include: {
                userFollowing: {
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

        const result = followers.map((e) => e.userFollowing);
        const count = await this.db.follow.count({ where: whereCondition });
        return { count, result } satisfies PaginatedResponse<typeof result>;
    }

    async following(currentUser: User, skip?: number, take?: number) {
        const whereCondition = { userFollowingId: currentUser.id };
        const following = await this.db.follow.findMany({
            where: whereCondition,
            skip: !skip ? DEFAULT_QUERY_SKIP : Number(skip),
            take: !take ? DEFAULT_QUERY_TAKE : Number(take),
            include: {
                userFollowed: {
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
        const result = following.map((e) => e.userFollowed);
        const count = await this.db.follow.count({ where: whereCondition });
        return { count, result } satisfies PaginatedResponse<typeof result>;
    }

    async list(search?: string, skip?: number, take?: number) {
        const whereCondition = {
            OR: [
                { username: { contains: search } },
                { profile: { displayName: { contains: search } } },
            ],
        };
        const users = await this.db.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                email: true,
                username: true,
                profile: {
                    select: { displayName: true, bio: true, icon: true },
                },
            },
            skip: !skip ? DEFAULT_QUERY_SKIP : Number(skip),
            take: !take ? DEFAULT_QUERY_TAKE : Number(take),
        });
        const count = await this.db.user.count({ where: whereCondition });
        return { count, result: users } satisfies PaginatedResponse<
            typeof users
        >;
    }

    async me(currentUser: User) {
        const user = await this.db.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                likesCount: true,
                postsCount: true,
                followingsCount: true,
                followersCount: true,
                profile: {
                    include: { icon: true },
                },
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async uploadProfilePicture(currentUser: User, file: Express.Multer.File) {
        const userFinded = await this.db.user.findFirst({
            where: {
                id: currentUser.id,
            },
        });

        if (!userFinded) {
            throw new NotFoundException('User not found');
        }

        const uploadedFile = await this.storage.uploadFilesAndGetStorageRecords(
            file,
        );

        await this.db.profile.update({
            where: {
                id: currentUser.profileId,
            },
            data: {
                iconStorageId: uploadedFile.id,
            },
        });

        return await this.me(currentUser);
    }
}
