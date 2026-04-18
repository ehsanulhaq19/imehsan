import { MigrationInterface, QueryRunner } from 'typeorm';

export class SocialLinksAndCertifications1740000000000 implements MigrationInterface {
  name = 'SocialLinksAndCertifications1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE "social_links" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying NOT NULL,
  "icon_url" character varying NOT NULL,
  "link_url" character varying NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_social_links" PRIMARY KEY ("id")
);

CREATE TABLE "certifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "slug" character varying NOT NULL,
  "heading" character varying NOT NULL,
  "detail" text,
  "link_url" character varying,
  "thumbnail_url" character varying,
  "sort_order" integer NOT NULL DEFAULT 0,
  "published" boolean NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_certifications" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_certifications_slug" UNIQUE ("slug")
);
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "certifications"`);
    await queryRunner.query(`DROP TABLE "social_links"`);
  }
}
