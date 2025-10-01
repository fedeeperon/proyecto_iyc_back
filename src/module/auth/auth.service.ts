import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  private generateToken(user: { id: string; email: string }) {
    const payload = { email: user.email, sub: user.id };
    return { 
      access_token: this.jwtService.sign(payload) // Usa la configuración del módulo (1h)
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const newUser: User = await this.usersService.create(createUserDto);

      return this.generateToken({
        id: newUser.id.toString(),
        email: newUser.email,
      });
    } catch (error) {
      if (error.code === 11000 || error.code === '23505') {
        throw new BadRequestException('Email ya registrado');
      }
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user: User | null = await this.usersService.findByEmail(loginUserDto.email,);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateToken({
      id: user.id.toString(),
      email: user.email,
    });
  }
}
