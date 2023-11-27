import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(private db: PrismaService) { }

    async update(currentUser: User, updateProfileDto: UpdateProfileDto) {
        return await this.db.profile.update({
            where: { id: currentUser.profileId },
            data: { ...updateProfileDto },
        });
    }
}
