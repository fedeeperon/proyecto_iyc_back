import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Categoria } from '../enum/categoria-column.enum';

@Entity('imc')
export class ImcEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('numeric', { precision: 5, scale: 2 })
  peso: number;

  @Column('numeric', { precision: 3, scale: 2 })
  altura: number;

  @Column('numeric', { precision: 5, scale: 3 })
  imc: number;

  @Column({ type: 'enum', enum: Categoria })
  categoria: Categoria;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
}
