import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Usuário autenticado com sucesso.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credênciais informadas inválidas.' })
    signin(@Body() signinAuthDto: SigninAuthDto) {
        return this.authService.signin(signinAuthDto);
    }

    @Post('signup')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Usuário criado com sucesso.' })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Nome de usuário inválido.\t\n Nome de usuário já utilizado.\t\n Email do usuário já utilizado.',
        isArray: true,
    })
    signup(@Body() signupAuthDto: SignupAuthDto) {
        return this.authService.signup(signupAuthDto);
    }
}
