import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, PrismaService, JwtStrategy],
    imports: [
        PassportModule,
        JwtModule.register({
            secret: jwtConfig.jwtSecret,
            signOptions: { expiresIn: jwtConfig.jwtExpiresIn }
        }),
    ]
})
export class AuthModule { }
