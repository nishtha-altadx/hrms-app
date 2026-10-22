import { BadRequestException, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it, vi } from "vitest";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { UsersService } from "./users.service.js";

function makeService(findOne = vi.fn()) {
  const repo = { update: vi.fn(), findOne };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { service: new UsersService(repo as any), repo };
}

describe("UsersService.updateProfile", () => {
  it("updates only the provided fields and returns the fresh user", async () => {
    const user = { id: "u1", firstName: "Jane" };
    const { service, repo } = makeService(vi.fn().mockResolvedValue(user));

    const result = await service.updateProfile("u1", { firstName: "Jane", phone: null });

    expect(repo.update).toHaveBeenCalledWith("u1", { firstName: "Jane", phone: null });
    expect(result).toBe(user);
  });

  it("rejects a future date of birth", async () => {
    const { service, repo } = makeService();
    await expect(service.updateProfile("u1", { dateOfBirth: "2999-01-01" })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("throws NotFound when the user no longer exists", async () => {
    const { service } = makeService(vi.fn().mockResolvedValue(null));
    await expect(service.updateProfile("u1", { firstName: "Jane" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe("UpdateProfileDto", () => {
  const errorsFor = async (body: object) =>
    (await validate(plainToInstance(UpdateProfileDto, body))).map((e) => e.property);

  it("accepts a valid partial update and null to clear optional fields", async () => {
    expect(await errorsFor({ firstName: " Jane ", phone: null, gender: null })).toEqual([]);
  });

  it("rejects bad phone, bad gender and empty names", async () => {
    const props = await errorsFor({ phone: "abc", gender: "x", firstName: "  " });
    expect(props.sort()).toEqual(["firstName", "gender", "phone"]);
  });
});
