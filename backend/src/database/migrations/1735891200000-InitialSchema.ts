import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1735891200000 implements MigrationInterface {
  name = 'InitialSchema1735891200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE "users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" character varying NOT NULL,
  "first_name" character varying,
  "last_name" character varying,
  "password_hash" character varying,
  "user_type" character varying(32) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_users" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_users_email" UNIQUE ("email")
);

CREATE TABLE "media" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "path" character varying NOT NULL,
  "mime_type" character varying NOT NULL,
  "original_name" character varying,
  "uploaded_by_id" uuid,
  "metadata" jsonb NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_media" PRIMARY KEY ("id"),
  CONSTRAINT "FK_media_uploaded_by" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE "projects" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "slug" character varying NOT NULL,
  "heading" character varying NOT NULL,
  "details" text,
  "link" character varying,
  "sort_order" integer NOT NULL DEFAULT 0,
  "published" boolean NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_projects" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_projects_slug" UNIQUE ("slug")
);

CREATE TABLE "project_media" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  "role" character varying(32) NOT NULL DEFAULT 'gallery',
  CONSTRAINT "PK_project_media" PRIMARY KEY ("id"),
  CONSTRAINT "FK_project_media_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "FK_project_media_media" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "case_studies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "slug" character varying NOT NULL,
  "title" character varying NOT NULL,
  "description" text,
  "external_link" character varying,
  "sort_order" integer NOT NULL DEFAULT 0,
  "published" boolean NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_case_studies" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_case_studies_slug" UNIQUE ("slug")
);

CREATE TABLE "case_study_media" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "case_study_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  CONSTRAINT "PK_case_study_media" PRIMARY KEY ("id"),
  CONSTRAINT "FK_csm_case_study" FOREIGN KEY ("case_study_id") REFERENCES "case_studies"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "FK_csm_media" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "git_repos" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying NOT NULL,
  "url" character varying NOT NULL,
  "description" text,
  "history_json" jsonb NOT NULL DEFAULT '[]',
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_git_repos" PRIMARY KEY ("id")
);

CREATE TABLE "testimonials" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "author_name" character varying NOT NULL,
  "quote" text NOT NULL,
  "approved" boolean NOT NULL DEFAULT false,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_testimonials" PRIMARY KEY ("id")
);

CREATE TABLE "testimonial_media" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "testimonial_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  "role" character varying(32) NOT NULL DEFAULT 'image',
  CONSTRAINT "PK_testimonial_media" PRIMARY KEY ("id"),
  CONSTRAINT "FK_tm_testimonial" FOREIGN KEY ("testimonial_id") REFERENCES "testimonials"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "FK_tm_media" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "vlogs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "slug" character varying NOT NULL,
  "heading" character varying NOT NULL,
  "description" text,
  "published" boolean NOT NULL DEFAULT false,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_vlogs" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_vlogs_slug" UNIQUE ("slug")
);

CREATE TABLE "vlog_media" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vlog_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  "role" character varying(32) NOT NULL,
  CONSTRAINT "PK_vlog_media" PRIMARY KEY ("id"),
  CONSTRAINT "FK_vm_vlog" FOREIGN KEY ("vlog_id") REFERENCES "vlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "FK_vm_media" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "vlog_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vlog_id" uuid NOT NULL,
  "author_name" character varying,
  "body" text NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_vlog_comments" PRIMARY KEY ("id"),
  CONSTRAINT "FK_vc_vlog" FOREIGN KEY ("vlog_id") REFERENCES "vlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "vlog_votes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vlog_id" uuid NOT NULL,
  "visitor_key" character varying(128) NOT NULL,
  "value" smallint NOT NULL,
  CONSTRAINT "PK_vlog_votes" PRIMARY KEY ("id"),
  CONSTRAINT "FK_vv_vlog" FOREIGN KEY ("vlog_id") REFERENCES "vlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "UQ_vlog_votes_vlog_visitor" UNIQUE ("vlog_id", "visitor_key")
);

CREATE TABLE "appointments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "booker_user_id" uuid,
  "appointment_date" date NOT NULL,
  "appointment_time" TIME NOT NULL,
  "contact_name" character varying NOT NULL,
  "contact_email" character varying NOT NULL,
  "contact_phone" character varying,
  "reason" text,
  "status" character varying(32) NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_appointments" PRIMARY KEY ("id"),
  CONSTRAINT "FK_appointments_booker" FOREIGN KEY ("booker_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE "appointment_media" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "appointment_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  CONSTRAINT "PK_appointment_media" PRIMARY KEY ("id"),
  CONSTRAINT "FK_am_appointment" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "FK_am_media" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "conversations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "guest_session_id" character varying(128) NOT NULL,
  "guest_name" character varying,
  "guest_email" character varying,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "role" character varying(32) NOT NULL,
  "content" text NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_conversation_messages" PRIMARY KEY ("id"),
  CONSTRAINT "FK_cm_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE "ai_widget_config" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "system_prompt" text,
  "provider" character varying(32) NOT NULL DEFAULT 'grok',
  "model" character varying,
  "api_key" character varying,
  "temperature" double precision NOT NULL DEFAULT 0.7,
  "max_tokens" integer NOT NULL DEFAULT 1024,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_ai_widget_config" PRIMARY KEY ("id")
);

CREATE TABLE "email_configs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "provider_type" character varying(32) NOT NULL,
  "host" character varying,
  "port" integer,
  "secure" boolean NOT NULL DEFAULT false,
  "username" character varying,
  "password" character varying,
  "from_address" character varying,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_email_configs" PRIMARY KEY ("id")
);

CREATE TABLE "user_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "visitor_id" character varying(128) NOT NULL,
  "user_agent" text,
  "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_user_sessions" PRIMARY KEY ("id")
);

CREATE TABLE "user_session_pages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL,
  "path" character varying(2048) NOT NULL,
  "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_user_session_pages" PRIMARY KEY ("id"),
  CONSTRAINT "FK_usp_session" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IDX_user_sessions_started_at" ON "user_sessions" ("started_at");
CREATE INDEX "IDX_user_session_pages_opened_at" ON "user_session_pages" ("opened_at");
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP TABLE IF EXISTS "user_session_pages";
DROP TABLE IF EXISTS "user_sessions";
DROP TABLE IF EXISTS "email_configs";
DROP TABLE IF EXISTS "ai_widget_config";
DROP TABLE IF EXISTS "conversation_messages";
DROP TABLE IF EXISTS "conversations";
DROP TABLE IF EXISTS "appointment_media";
DROP TABLE IF EXISTS "appointments";
DROP TABLE IF EXISTS "vlog_votes";
DROP TABLE IF EXISTS "vlog_comments";
DROP TABLE IF EXISTS "vlog_media";
DROP TABLE IF EXISTS "vlogs";
DROP TABLE IF EXISTS "testimonial_media";
DROP TABLE IF EXISTS "testimonials";
DROP TABLE IF EXISTS "git_repos";
DROP TABLE IF EXISTS "case_study_media";
DROP TABLE IF EXISTS "case_studies";
DROP TABLE IF EXISTS "project_media";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "media";
DROP TABLE IF EXISTS "users";
`);
  }
}
