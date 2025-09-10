import { Injectable } from "@nestjs/common";
import { CalcularImcDto } from "./dto/calcular-imc-dto";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImcEntity } from './entities/imc.entity';

@Injectable()
export class ImcService {
  constructor(
    @InjectRepository(ImcEntity)
    private readonly imcRepository: Repository<ImcEntity>,
  ) {}

  async calcularImc(data: CalcularImcDto): Promise<ImcEntity> {
    try {
      const { altura, peso } = data;
      const imc = peso / (altura * altura);
      const imcRedondeado = Math.round(imc * 100) / 100;
  
      let categoria: string;
      if (imc < 18.5) categoria = 'Bajo peso';
      else if (imc < 25) categoria = 'Normal';
      else if (imc < 30) categoria = 'Sobrepeso';
      else categoria = 'Obeso';
  
      const resultado = this.imcRepository.create({
        peso,
        altura,
        imc: imcRedondeado,
        categoria,
      });
  
      return await this.imcRepository.save(resultado);
    } catch (error) {
      console.error("Error guardando IMC:", error);
      throw error; // así el controller devuelve 500 con el error real
    }
  }
  

  async historial(): Promise<ImcEntity[]> {
    try {
      return await this.imcRepository.find({ order: { fecha: 'DESC' } });
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      throw error;
    }
  }
  
}
