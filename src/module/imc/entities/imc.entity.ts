import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity('imc')
export class ImcEntity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  peso: number;

  @Column()
  altura: number;

  @Column()
  imc: number;

  @Column()
  categoria: string;

  @Column()
  fecha: Date;

  @Column()
  userId: ObjectId; 
}

