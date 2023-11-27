import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Patch('me')
    update(
        @Body() updateProfileDto: UpdateProfileDto,
        @CurrentUser() currentUser: User,
    ) {
        return this.profileService.update(currentUser, updateProfileDto);
    }
}
