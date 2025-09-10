import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateImcTable1757531503041 implements MigrationInterface {
    name = 'CreateImcTable1757531503041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "imc" ("id" SERIAL NOT NULL, "peso" numeric(5,2) NOT NULL, "altura" numeric(3,2) NOT NULL, "imc" numeric(5,3) NOT NULL, "categoria" "public"."imc_categoria_enum" NOT NULL, "fecha" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_b2f38b824da5846f543dcee14cc" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "imc"`);
    }

}
