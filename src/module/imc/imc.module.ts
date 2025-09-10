import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcService } from './imc.service';
import { ImcController } from './imc.controller';
import { ImcEntity } from './entities/imc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImcEntity])],
  controllers: [ImcController],
  providers: [ImcService],
})
export class ImcModule {}
