import { MigrationInterface, QueryRunner } from 'typeorm';

export class VlogVoteCreatedAt1741000000000 implements MigrationInterface {
  name = 'VlogVoteCreatedAt1741000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vlog_votes"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vlog_votes" DROP COLUMN IF EXISTS "created_at"
    `);
  }
}
