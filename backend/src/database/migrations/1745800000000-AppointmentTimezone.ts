import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppointmentTimezone1745800000000 implements MigrationInterface {
  name = 'AppointmentTimezone1745800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "timezone" character varying(64) NOT NULL DEFAULT 'UTC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "timezone"`);
  }
}
