import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    try {
      // Verificar que el usuario aún existe en la base de datos
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(payload.sub) } as any
      });
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      
      return {
        id: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      console.error('Error en validación JWT:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }
  
}