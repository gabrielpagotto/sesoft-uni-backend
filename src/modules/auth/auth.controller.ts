import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    signin(@Body() signinAuthDto: SigninAuthDto) {
        return this.authService.signin(signinAuthDto);
    }

    @Post('signup')
    @HttpCode(HttpStatus.OK)
    signup(@Body() signupAuthDto: SignupAuthDto) {
        return this.authService.signup(signupAuthDto);
    }
}
