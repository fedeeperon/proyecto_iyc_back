import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { IImcRepository } from './imc-repository.interface';
import { ImcEntity } from '../entities/imc.entity';
import { CreateImcDto } from '../dto/create-imc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ImcRepository implements IImcRepository {
    private readonly logger = new Logger('ImcRepository');
    constructor(
        @InjectRepository(ImcEntity)
        private readonly repository: Repository<ImcEntity>,
    ) {}
    async createAndSave(data: CreateImcDto): Promise<ImcEntity> {
        this.logger.debug(
            `Creando registro IMC con los siguientes datos: ${JSON.stringify(data)}`,
        );
        try {
            const imc = this.repository.create(data);
            return await this.repository.save(imc);
        } catch (error) {
            this.logger.error(
                `Error al crear registro IMC: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                'No se pudo crear el registro IMC',
            );
        }
    }
    async find(
        esDescendente: boolean,
        skip: number,
        take: number,
    ): Promise<ImcEntity[]> {
        try {
            if (esDescendente)
                return await this.repository.find({
                    order: { fecha: 'DESC' },
                    skip: skip,
                    take: take,
                });
            else
                return await this.repository.find({
                    order: { fecha: 'ASC' },
                    skip: skip,
                    take: take,
                });
        } catch (error) {
            this.logger.error(
                `Error al obtener el historial de IMC: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                'No se pudo obtener el historial de IMC',
            );
        }
    }
}
