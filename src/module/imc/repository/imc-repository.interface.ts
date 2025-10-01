import { ImcEntity } from '../entities/imc.entity';
import { ObjectId } from 'mongodb';

export interface IImcRepository {
    createAndSave(data: ImcEntity): Promise<ImcEntity>;

    findByUser(userId: ObjectId, esDescendente: boolean, skip: number, take?: number): Promise<ImcEntity[]>;
}
