import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class TimelineService {
    constructor(private db: PrismaService) { }

    async timeline(currentUser: User) {
        return await this.db.$queryRaw`
          SELECT P.* FROM posts P
            JOIN follows f ON P.user_id = f.user_following_id
            WHERE f.user_followed_id = ${currentUser.id}
            AND p.created_at >= (
                    SELECT f2.created_at
                    FROM follows f2
                    WHERE f2.user_followed_id = ${currentUser.id}
                    AND f2.user_following_id = p.user_id
            )
            AND P.post_id IS NULL
            ORDER BY P.created_at DESC;
        `
    }
}
