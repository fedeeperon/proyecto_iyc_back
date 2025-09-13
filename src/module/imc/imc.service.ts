import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImcEntity } from './entities/imc.entity';
import { ImcMapper } from './mappers/imc.mapper';

@Injectable()
export class ImcService {
  private readonly logger = new Logger('ImcService');

  constructor(@InjectRepository(ImcEntity) private readonly imcRepository: Repository<ImcEntity>) {}

  async calcularImc(data: { peso: number; altura: number }) {
    const imc = data.peso / (data.altura * data.altura);
    let categoria = '';

    if (imc < 18.5) categoria = 'Bajo peso';
    else if (imc < 25) categoria = 'Normal';
    else if (imc < 30) categoria = 'Sobrepeso';
    else categoria = 'Obeso';

    const registro = this.imcRepository.create({
      peso: data.peso,
      altura: data.altura,
      imc,
      categoria,
      fecha: new Date(),
    });

    return await this.imcRepository.save(registro);
  }

  async getHistorial(esDescendente: boolean, skip: number, take?: number) {
    this.logger.debug(`Obteniendo historial de IMC: descendente=${esDescendente}, skip=${skip}, take=${take ?? 'TODOS'}`);

    try {
      const encontrados = await this.imcRepository.find({
        order: { fecha: esDescendente ? 'DESC' : 'ASC' },
        skip,
        ...(take ? { take } : {}), // si take no viene → devuelve todos
      });

      return ImcMapper.toCreateDtoList(encontrados);
    } catch (error) {
      this.logger.error(`Error al obtener el historial de IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo obtener el historial de IMC');
    }
  }
}
