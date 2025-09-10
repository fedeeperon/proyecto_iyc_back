import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Check,
    UpdateDateColumn,
} from 'typeorm';
import { Categoria } from '../enum/categoria-column.enum';

@Entity('imc')
@Check(`"peso" > 0 AND "peso" < 500`)
@Check(`"altura" > 0 AND "altura" < 3`)
@Check(`"imc" >= 0 AND "imc" < 100`)
export class ImcEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 }) //ejemplo maximo: 999.99
    peso: number;

    @Column({ type: 'decimal', precision: 3, scale: 2 }) //ejemplo maximo: 9.99
    altura: number;

    @Column({ type: 'decimal', precision: 5, scale: 3 }) //ejemplo maximo: 99.999
    imc: number;

    @Column({
        type: 'enum',
        enum: Categoria, //importada
    })
    categoria: Categoria;

    @Column({ type: 'timestamp' })
    fecha: Date;

    // No tienen uso por ahora, porque los endpoints no los usan, pero quedan para futuras implementaciones
    // vvv

    @CreateDateColumn({ type: 'timestamp' }) //typeorm lo setea automaticamente
    createdAt: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true }) //typeorm lo setea automaticamente
    deletedAt: Date | null;

    @UpdateDateColumn({ type: 'timestamp', nullable: true }) //typeorm lo setea automaticamente
    updatedAt: Date | null;
}
