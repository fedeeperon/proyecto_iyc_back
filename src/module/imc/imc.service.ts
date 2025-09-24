import { Injectable, InternalServerErrorException, Logger, Inject } from '@nestjs/common';
import { CalcularImcDto } from './dto/calcular-imc.dto';
import { IImcRepository } from './repository/imc-repository.interface';
import { ImcMapper } from './mappers/imc.mapper';
import { User } from '../user/entities/user.entity';
import { ImcEntity } from './entities/imc.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ImcService {
  private readonly logger = new Logger('ImcService');

  constructor(
    @Inject('IImcRepository')
    private readonly imcRepository: IImcRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async calcularImc(data: CalcularImcDto, user: User) {
    this.logger.debug(`Calculando IMC con datos: ${JSON.stringify(data)} para usuario ${user.email}`);
    try {
      const { peso, altura } = data;

      // Validaciones básicas
      if (altura <= 0 || altura >= 3) throw new Error('La altura debe ser mayor a 0 y menor a 3 metros');
      if (peso <= 0 || peso >= 500) throw new Error('El peso debe ser mayor a 0 y menor a 500 kg');

      const imc = peso / (altura * altura);
      const imcRedondeado = Math.round(imc * 100) / 100;

      let categoria: string;
      if (imc < 18.5) categoria = 'Bajo peso';
      else if (imc < 25) categoria = 'Normal';
      else if (imc < 30) categoria = 'Sobrepeso';
      else categoria = 'Obeso';

      // 🔹 Buscar entidad real del usuario
      const usuarioEntity = await this.userRepository.findOne({
        where: { id: user.id }, // user.id viene del JWT
      });
      console.log(usuarioEntity);
      if (!usuarioEntity) throw new Error('Usuario no encontrado');

      // Crear entidad IMC
      const imcEntity = new ImcEntity();
      imcEntity.peso = peso;
      imcEntity.altura = altura;
      imcEntity.imc = imcRedondeado;
      imcEntity.categoria = categoria;
      imcEntity.fecha = new Date();
      imcEntity.user = user;

      this.logger.log(`Guardando IMC calculado para usuario ${user.email}: ${JSON.stringify(imcEntity)}`);

      const resultado = await this.imcRepository.createAndSave(imcEntity);
      return ImcMapper.toCreateDto(resultado);

    } catch (error) {
      this.logger.error(`Error al crear el registro IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo crear el registro IMC');
    }
  }

  async getHistorial(user: User, skip: number, take?: number, esDescendente = true) {
    this.logger.debug(`Obteniendo historial de IMC para ${user.email}: descendente=${esDescendente}, skip=${skip}, take=${take ?? 'TODOS'}`);
    try {
      const encontrados = await this.imcRepository.findByUser(user, esDescendente, skip, take);
      return ImcMapper.toCreateDtoList(encontrados);
    } catch (error) {
      this.logger.error(`Error al obtener el historial de IMC: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo obtener el historial de IMC');
    }
  }
}
