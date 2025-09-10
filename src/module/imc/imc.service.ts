import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CalcularImcDto } from './dto/calcular-imc.dto';
import { IImcRepository } from './repository/imc-repository.interface';
import { CreateImcDto } from './dto/create-imc.dto';
import { ImcMapper } from './mappers/imc.mapper';
import { Categoria } from './enum/categoria-column.enum';

@Injectable()
export class ImcService {
  private readonly logger = new Logger('ImcService');

  constructor(
    @Inject('IImcRepository')
    private readonly imcRepository: IImcRepository,
  ) {}

  async calcularImc(data: CalcularImcDto) {
    this.logger.debug(`Calculando IMC con datos: ${JSON.stringify(data)}`);
    try {
      const { peso, altura } = data;

      const imc = peso / (altura * altura);
      const imcRedondeado = Math.round(imc * 100) / 100;

      let categoria: Categoria;
      if (imc < 18.5) categoria = Categoria.BAJO;
      else if (imc < 25) categoria = Categoria.NORMAL;
      else if (imc < 30) categoria = Categoria.SOBRE_PESO;
      else categoria = Categoria.OBESO;

      const createData: CreateImcDto = {
        peso,
        altura,
        imc: imcRedondeado,
        categoria,
        fecha: new Date(),
      };

      this.logger.log(`Guardando IMC calculado: ${JSON.stringify(createData)}`);

      const resultado = await this.imcRepository.createAndSave(createData);

      return ImcMapper.toDto(resultado);
    } catch (error) {
      this.logger.error(`Error al crear el registro IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo crear el registro IMC');
    }
  }

  async getHistorial(esDescendente: boolean, skip: number, take: number) {
    this.logger.debug(
      `Obteniendo historial de IMC con datos: descendente: ${esDescendente}, skip: ${skip}, take: ${take}`
    );
    try {
      const encontrados = await this.imcRepository.find(esDescendente, skip, take);
      return ImcMapper.toDtoList(encontrados);
    } catch (error) {
      this.logger.error(`Error al obtener el historial de IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo obtener el historial de IMC');
    }
  }
}
