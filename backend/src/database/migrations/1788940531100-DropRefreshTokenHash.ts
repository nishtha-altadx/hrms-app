import { MigrationInterface, QueryRunner } from "typeorm";

export class DropRefreshTokenHash1788940531100 implements MigrationInterface {
    name = 'DropRefreshTokenHash1788940531100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token_hash"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token_hash" character varying`);
    }

}
