import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CalcularImcDto } from './dto/calcular-imc.dto';
import { IImcRepository } from './repository/imc-repository.interface';
import { ImcMapper } from './mappers/imc.mapper';
import { ImcEntity } from './entities/imc.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';


@Injectable()
export class ImcService {
  private readonly logger = new Logger('ImcService');

  constructor(
    @Inject('IImcRepository')
    private readonly imcRepository: IImcRepository,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async calcularImc(data: CalcularImcDto, userId: ObjectId) {
    this.logger.debug(
      `Calculando IMC con datos: ${JSON.stringify(data)} para usuario ${userId.toHexString()}`,
    );

    try {
      const { peso, altura } = data;

      if (peso === undefined || altura === undefined)
        throw new BadRequestException('La altura y el peso no pueden estar vacíos');
      if (typeof peso !== 'number' || typeof altura !== 'number')
        throw new BadRequestException('La altura y el peso deben ser valores numéricos válidos');
      if (!Number.isFinite(peso) || !Number.isFinite(altura))
        throw new BadRequestException('La altura y el peso deben ser valores numéricos válidos');
      if (peso <= 0 || peso >= 500) throw new BadRequestException('Peso inválido');
      if (altura <= 0 || altura >= 3) throw new BadRequestException('Altura inválida');

      const alturaDecimales = altura.toString().split('.')[1]?.length || 0;
      const pesoDecimales = peso.toString().split('.')[1]?.length || 0;
      if (alturaDecimales > 2)
        throw new BadRequestException('La altura no puede tener más de 2 decimales');
      if (pesoDecimales > 2)
        throw new BadRequestException('El peso no puede tener más de 2 decimales');

      // Cálculo IMC
      const imc = peso / (altura * altura);
      const imcRedondeado = Math.round(imc * 100) / 100;

      let categoria: string;
      if (imc < 18.5) categoria = 'Bajo peso';
      else if (imc < 25) categoria = 'Normal';
      else if (imc < 30) categoria = 'Sobrepeso';
      else categoria = 'Obeso';

      // Crear IMCEntity
      const imcEntity = new ImcEntity();
      imcEntity.peso = peso;
      imcEntity.altura = altura;
      imcEntity.imc = imcRedondeado;
      imcEntity.categoria = categoria;
      imcEntity.fecha = new Date();
      imcEntity.userId = userId;

      this.logger.log(`Guardando IMC calculado: ${JSON.stringify(imcEntity)}`);

      const resultado = await this.imcRepository.createAndSave(imcEntity);
      return ImcMapper.toCreateDto(resultado);
    } catch (error) {
      this.logger.error(`Error al crear el registro IMC: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('No se pudo crear el registro IMC');
    }
  }

  async getHistorial(userId: ObjectId, skip: number, take?: number, esDescendente = true) {
    this.logger.debug(
      `Obteniendo historial de IMC para usuario ${userId.toHexString()}: descendente=${esDescendente}, skip=${skip}, take=${take ?? 'TODOS'}`,
    );
    try {
      const encontrados = await this.imcRepository.findByUser(
        userId,
        esDescendente,
        skip,
        take,
      );
      return ImcMapper.toCreateDtoList(encontrados);
    } catch (error) {
      this.logger.error(`Error al obtener el historial de IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo obtener el historial de IMC');
    }
  }

  async getEstadisticas(userId: ObjectId) {
    this.logger.debug(`Calculando estadísticas de IMC para usuario ${userId.toHexString()}`);
    try {
      const registros = await this.imcRepository.findByUser(userId, true, 0);
      console.log(`Registros encontrados para estadísticas: ${registros.length}`);
      
      if (!registros || !Array.isArray(registros)) {
        console.error('Los registros devueltos no son un array válido:', registros);
        return { imcMensual: [], variacionPeso: [] };
      }
      
      if (registros.length === 0) {
        console.log('No hay registros, devolviendo objeto vacío');
        return { imcMensual: [], variacionPeso: [] };
      }

      // Validar que los registros tengan los campos necesarios
      const registrosValidos = registros.filter(r => {
        if (!r || typeof r.imc !== 'number' || typeof r.peso !== 'number' || !r.fecha) {
          console.warn('Registro inválido encontrado:', r);
          return false;
        }
        return true;
      });
      
      console.log(`Registros válidos: ${registrosValidos.length} de ${registros.length}`);
      
      if (registrosValidos.length === 0) {
        console.log('No hay registros válidos, devolviendo objeto vacío');
        return { imcMensual: [], variacionPeso: [] };
      }

      const agrupadosPorMes = new Map<string, ImcEntity[]>();
      
      // Mapeo manual de meses para evitar problemas de localización
      const mesesMap = {
        0: 'ene', 1: 'feb', 2: 'mar', 3: 'abr', 4: 'may', 5: 'jun',
        6: 'jul', 7: 'ago', 8: 'sep', 9: 'oct', 10: 'nov', 11: 'dic'
      };
      
      for (const r of registrosValidos) {
        try {
          // Validar que la fecha sea válida
          let fecha: Date;
          if (r.fecha instanceof Date) {
            fecha = r.fecha;
          } else {
            fecha = new Date(r.fecha);
          }
          
          // Verificar que la fecha sea válida
          if (isNaN(fecha.getTime())) {
            console.warn(`Fecha inválida encontrada en registro:`, r);
            continue; // Saltar este registro
          }
          
          const mesNumero = fecha.getMonth(); // 0-11
          const mes = mesesMap[mesNumero];
          
          if (!mes) {
            console.warn(`Mes inválido encontrado: ${mesNumero} para fecha: ${fecha}`);
            continue; // Saltar este registro
          }
          
          console.log(`Procesando registro con fecha ${fecha.toISOString()} -> mes número: ${mesNumero} -> mes: ${mes}`);
          
          if (!agrupadosPorMes.has(mes)) agrupadosPorMes.set(mes, []);
          agrupadosPorMes.get(mes)!.push(r);
        } catch (fechaError) {
          console.error(`Error procesando fecha para registro:`, r, fechaError);
          continue; // Saltar registros con fechas problemáticas
        }
      }

      console.log(`Datos agrupados por mes:`, Array.from(agrupadosPorMes.keys()));

      if (agrupadosPorMes.size === 0) {
        console.log('No se pudieron agrupar datos por mes');
        return { imcMensual: [], variacionPeso: [] };
      }

      const imcMensual: { mes: string; imc: number }[] = [];
      const variacionPeso: { mes: string; peso: number }[] = [];

      for (const [mes, registrosMes] of agrupadosPorMes.entries()) {
        try {
          if (!registrosMes || registrosMes.length === 0) continue;
          
          const promedioIMC =
            registrosMes.reduce((acc, r) => acc + r.imc, 0) / registrosMes.length;
          const promedioPeso =
            registrosMes.reduce((acc, r) => acc + r.peso, 0) / registrosMes.length;

          // Validar que los promedios sean números válidos
          if (isNaN(promedioIMC) || isNaN(promedioPeso)) {
            console.warn(`Promedios inválidos para mes ${mes}:`, { promedioIMC, promedioPeso });
            continue;
          }

          imcMensual.push({ mes, imc: Number(promedioIMC.toFixed(2)) });
          variacionPeso.push({ mes, peso: Number(promedioPeso.toFixed(2)) });
        } catch (promedioError) {
          console.error(`Error calculando promedios para mes ${mes}:`, promedioError);
        }
      }

      const ordenMeses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      imcMensual.sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));
      variacionPeso.sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));

      const resultado = { imcMensual, variacionPeso };
      console.log('Resultado final de estadísticas:', JSON.stringify(resultado, null, 2));
      
      return resultado;
    } catch (error) {
      this.logger.error(`Error al calcular estadísticas de IMC: ${error.message}`, error.stack);
      console.error('Stack trace completo:', error);
      throw new InternalServerErrorException('No se pudieron obtener estadísticas de IMC');
    }
  }
}
