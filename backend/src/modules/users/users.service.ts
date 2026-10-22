import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Gender, User } from "../../database/entities/user.entity.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: Gender;
  }): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(id, { passwordHash });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.dateOfBirth && new Date(dto.dateOfBirth) > new Date()) {
      throw new BadRequestException("Date of birth cannot be in the future");
    }

    const { firstName, lastName, phone, dateOfBirth, gender } = dto;
    const changes = { firstName, lastName, phone, dateOfBirth, gender };
    const defined = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(defined).length > 0) {
      await this.usersRepository.update(id, defined);
    }

    const user = await this.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}
