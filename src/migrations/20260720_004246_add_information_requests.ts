import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_information_requests_topic" AS ENUM('general', 'affected-client', 'crypto-solicitation');
  CREATE TYPE "public"."enum_information_requests_status" AS ENUM('new', 'in-review', 'responded', 'closed');
  CREATE TABLE "information_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"topic" "enum_information_requests_topic" DEFAULT 'general',
  	"message" varchar NOT NULL,
  	"document_id" integer,
  	"status" "enum_information_requests_status" DEFAULT 'new',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "request_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submitter_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "information_requests_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "request_documents_id" integer;
  ALTER TABLE "information_requests" ADD CONSTRAINT "information_requests_document_id_request_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."request_documents"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "information_requests_document_idx" ON "information_requests" USING btree ("document_id");
  CREATE INDEX "information_requests_updated_at_idx" ON "information_requests" USING btree ("updated_at");
  CREATE INDEX "information_requests_created_at_idx" ON "information_requests" USING btree ("created_at");
  CREATE INDEX "request_documents_updated_at_idx" ON "request_documents" USING btree ("updated_at");
  CREATE INDEX "request_documents_created_at_idx" ON "request_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "request_documents_filename_idx" ON "request_documents" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_information_requests_fk" FOREIGN KEY ("information_requests_id") REFERENCES "public"."information_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_request_documents_fk" FOREIGN KEY ("request_documents_id") REFERENCES "public"."request_documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_information_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("information_requests_id");
  CREATE INDEX "payload_locked_documents_rels_request_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("request_documents_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "information_requests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "request_documents" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "information_requests" CASCADE;
  DROP TABLE "request_documents" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_information_requests_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_request_documents_fk";
  
  DROP INDEX "payload_locked_documents_rels_information_requests_id_idx";
  DROP INDEX "payload_locked_documents_rels_request_documents_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "information_requests_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "request_documents_id";
  DROP TYPE "public"."enum_information_requests_topic";
  DROP TYPE "public"."enum_information_requests_status";`)
}
