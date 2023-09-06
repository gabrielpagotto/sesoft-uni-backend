import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from 'src/config/jwt.config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, PrismaService, JwtStrategy],
    imports: [
        PassportModule,
        JwtModule.register({
            secret: jwtConfig.jwtSecret,
            signOptions: { expiresIn: jwtConfig.jwtExpiresIn },
        }),
    ],
})
export class AuthModule {}
