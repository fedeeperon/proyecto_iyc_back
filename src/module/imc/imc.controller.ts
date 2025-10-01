import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Query,
  UseGuards,
  Req,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { ObjectId } from 'mongodb';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @Post('calcular')
  async calcular(
    @Body(ValidationPipe) data: CalcularImcDto,
    @Req() req: AuthRequest,
  ) {
    try {
      console.log('Calculando IMC para usuario:', req.user.id);
      
      if (!ObjectId.isValid(req.user.id)) {
        throw new BadRequestException('ID de usuario inválido');
      }
      
      const userId = new ObjectId(req.user.id);
      const result = await this.imcService.calcularImc(data, userId);
      
      console.log('IMC calculado exitosamente');
      return result;
    } catch (error) {
      console.error('Error al calcular IMC:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al calcular IMC');
    }
  }

  @Get('historial')
  async getHistorial(@Query() query: PaginationDto, @Req() req: AuthRequest) {
    console.log('Obteniendo historial para usuario:', req.user.id);

    try {
      if (!ObjectId.isValid(req.user.id)) {
        throw new BadRequestException('ID de usuario inválido');
      }
      
      const esDescendente = query.esDescendente ?? true;
      const skip = Number(query.skip ?? 0);
      const take = query.take ? Number(query.take) : undefined;
      const userId = new ObjectId(req.user.id);

      const result = await this.imcService.getHistorial(userId, skip, take, esDescendente);
      console.log(`Historial obtenido: ${result.length} registros`);
      
      return result;
    } catch (error) {
      console.error('Error al cargar historial:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al cargar historial');
    }
  }

  @Get('test-auth')
  async testAuth(@Req() req: AuthRequest) {
    console.log('Test de autenticación - Usuario:', req.user);
    return {
      message: 'Autenticación exitosa',
      user: req.user,
      userId: req.user.id,
      isValidObjectId: ObjectId.isValid(req.user.id)
    };
  }

  @Get('estadisticas')
  async getEstadisticas(@Req() req: AuthRequest) {
    console.log('=== INICIO OBTENER ESTADÍSTICAS ===');

    try {
      if (!req.user || !req.user.id) {
        console.error('Usuario no encontrado en request');
        throw new BadRequestException('Usuario no autenticado correctamente');
      }

      console.log('Obteniendo estadísticas para usuario:', req.user.id);
      console.log('Datos del usuario completos:', req.user);

      if (!ObjectId.isValid(req.user.id)) {
        console.error('ID de usuario inválido:', req.user.id);
        throw new BadRequestException('ID de usuario inválido');
      }

      const userId = new ObjectId(req.user.id);
      console.log('ObjectId creado correctamente:', userId.toHexString());

      const result = await this.imcService.getEstadisticas(userId);

      console.log('Estadísticas obtenidas exitosamente');
      console.log('=== FIN OBTENER ESTADÍSTICAS ===');
      return result;
    } catch (error) {
      console.error('=== ERROR EN ESTADÍSTICAS ===');
      console.error('Tipo de error:', error.constructor.name);
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error('=== FIN ERROR ===');

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al cargar estadísticas');
    }
  }
}
