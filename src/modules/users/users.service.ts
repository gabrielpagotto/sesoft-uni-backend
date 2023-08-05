import { BadRequestException, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

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
        return { followed: true };
    }
}
