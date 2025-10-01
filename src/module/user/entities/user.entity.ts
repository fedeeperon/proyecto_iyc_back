import { ObjectId } from 'mongodb';
import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

}
