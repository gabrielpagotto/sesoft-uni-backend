import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { encriptPassword } from 'src/helpers/password.helper';
import { omitObjectFields as deleteObjectFields } from 'src/helpers/object.helper';
import { validateUsername } from 'src/helpers/validators.helper';

@Injectable()
export class AuthService {

    constructor(private db: PrismaService) { }

    signin(signinAuthDto: SigninAuthDto) {

    }

    async signup(signupAuthDto: SignupAuthDto) {
        const usernameValidation = validateUsername(signupAuthDto.username);
        if (usernameValidation) {
            throw new BadRequestException(usernameValidation);
        }
        if (await this.db.user.findUnique({ where: { username: signupAuthDto.username } })) {
            throw new BadRequestException("A user already uses this username");
        }
        if (await this.db.user.findUnique({ where: { email: signupAuthDto.email } })) {
            throw new BadRequestException("A user already uses this email");
        }
        const hashedPassword = await encriptPassword(signupAuthDto.password);
        const userCreateData = deleteObjectFields(signupAuthDto, ['password']);
        const user = await this.db.user.create({ data: { ...userCreateData, hashedPassword } });
        return deleteObjectFields(user, ['hashedPassword']);
    }
}
