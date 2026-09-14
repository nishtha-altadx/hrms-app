import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileFieldsToUser1789103946787 implements MigrationInterface {
    name = 'AddProfileFieldsToUser1789103946787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "first_name" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_name" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "date_of_birth" date`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "gender" "public"."users_gender_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "date_of_birth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
    }

}
