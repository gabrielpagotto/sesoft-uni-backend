import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class NotificationsService {
    async sendNotificationToUser(options: {
        title: string;
        description?: string;
        user: User;
    }) {
        // @TODO: Implement the logic to send notifications for an user
    }
}
