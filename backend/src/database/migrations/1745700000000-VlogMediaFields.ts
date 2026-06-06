import { MigrationInterface, QueryRunner } from 'typeorm';

export class VlogMediaFields1745700000000 implements MigrationInterface {
  name = 'VlogMediaFields1745700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vlog_media" ADD "sort_order" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "vlog_media" ADD "type" character varying(32) NOT NULL DEFAULT 'default'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vlog_media" ADD "is_public_view" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vlog_media" DROP COLUMN "is_public_view"`);
    await queryRunner.query(`ALTER TABLE "vlog_media" DROP COLUMN "type"`);
    await queryRunner.query(`ALTER TABLE "vlog_media" DROP COLUMN "sort_order"`);
  }
}
