import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { omitObjectFields as deleteObjectFields } from 'src/helpers/object.helper';
import { encriptPassword, verifyPassword } from 'src/helpers/password.helper';
import { validateUsername } from 'src/helpers/validators.helper';
import { PrismaService } from '../prisma/prisma.service';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly db: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUserCredentials(
        email: string,
        password: string,
    ): Promise<User | null> {
        const user = await this.db.user.findFirst({ where: { email } });
        if (!user) {
            return null;
        }
        if (!(await verifyPassword(password, user.hashedPassword))) {
            return null;
        }
        return user;
    }

    async signin(signinAuthDto: SigninAuthDto) {
        const user = await this.validateUserCredentials(
            signinAuthDto.email,
            signinAuthDto.password,
        );
        if (!user) {
            throw new UnauthorizedException('Username or password is invalid.');
        }
        return {
            token: this.jwtService.sign(user),
        };
    }

    async signup(signupAuthDto: SignupAuthDto) {
        const usernameValidation = validateUsername(signupAuthDto.username);
        if (usernameValidation) {
            throw new BadRequestException(usernameValidation);
        }
        if (
            await this.db.user.findUnique({
                where: { username: signupAuthDto.username },
            })
        ) {
            throw new BadRequestException('A user already uses this username');
        }
        if (
            await this.db.user.findUnique({
                where: { email: signupAuthDto.email },
            })
        ) {
            throw new BadRequestException('A user already uses this email');
        }
        const hashedPassword = await encriptPassword(signupAuthDto.password);
        const userCreateData = deleteObjectFields(signupAuthDto, ['password']);
        const user = await this.db.user.create({
            data: {
                email: userCreateData.email,
                username: userCreateData.username,
                hashedPassword,
                profile: {
                    create: { displayName: userCreateData.displayName },
                },
            },
        });
        return { token: this.jwtService.sign(user) };
    }
}
