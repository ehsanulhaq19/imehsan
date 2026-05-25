import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoverImages1745600000000 implements MigrationInterface {
  name = 'CoverImages1745600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "case_studies" ADD "cover_image_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "cover_image_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "certifications" ADD "cover_image_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "testimonials" ADD "cover_image_url" character varying`,
    );
    await queryRunner.query(
      `UPDATE "certifications" SET "cover_image_url" = "thumbnail_url" WHERE "cover_image_url" IS NULL AND "thumbnail_url" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "testimonials" DROP COLUMN "cover_image_url"`);
    await queryRunner.query(`ALTER TABLE "certifications" DROP COLUMN "cover_image_url"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "cover_image_url"`);
    await queryRunner.query(`ALTER TABLE "case_studies" DROP COLUMN "cover_image_url"`);
  }
}
