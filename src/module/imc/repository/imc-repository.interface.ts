import { CreateImcDto } from '../dto/create-imc.dto';
import { ImcEntity } from '../entities/imc.entity';

export interface IImcRepository {
    createAndSave(data: CreateImcDto): Promise<ImcEntity>;
    find(
        esDescendente: boolean,
        skip: number,
        take?: number,
    ): Promise<ImcEntity[]>;
}
