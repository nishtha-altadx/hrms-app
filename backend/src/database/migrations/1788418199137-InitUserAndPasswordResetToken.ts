import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUserAndPasswordResetToken1788418199137 implements MigrationInterface {
    name = 'InitUserAndPasswordResetToken1788418199137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'supervisor', 'employee')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee', "is_active" boolean NOT NULL DEFAULT true, "google_id" character varying, "refresh_token_hash" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"`);
        await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
