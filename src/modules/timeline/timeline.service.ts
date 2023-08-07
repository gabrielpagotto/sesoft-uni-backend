import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class TimelineService {
    constructor(private db: PrismaService) { }

    async timeline(currentUser: User) {
        return await this.db.$queryRaw`
            SELECT p.*
            FROM posts p
            JOIN follows f ON p.user_id = f.user_followed_id
            WHERE f.user_following_id = ${currentUser.id}
            AND p.created_at >= (
                SELECT f2.created_at
                FROM follows f2
                WHERE f2.user_following_id = ${currentUser.id}
                AND f2.user_followed_id = p.user_id
            )
            AND p.post_id IS NULL
            ORDER BY p.created_at DESC;
        `
    }
}
