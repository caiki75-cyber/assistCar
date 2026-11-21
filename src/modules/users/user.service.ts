/**
 * UserService — regras de negócio do módulo User.
 *
 * Orquestra validações, transformações e chamadas ao repository.
 * NÃO executa consultas Prisma diretamente.
 */

import bcrypt from "bcryptjs";
import * as UserRepository from "./user.repository";
import type {
  SafeUser,
  PaginationOptions,
  PaginatedResult,
} from "./user.types";
import type { CreateUserDTO, UpdateUserDTO } from "./user.dto";

// ---------------------------------------------------------------------------
// Erros de domínio
// ---------------------------------------------------------------------------

export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Usuário não encontrado: ${identifier}`);
    this.name = "UserNotFoundError";
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`O e-mail "${email}" já está cadastrado.`);
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("E-mail ou senha incorretos.");
    this.name = "InvalidCredentialsError";
  }
}

export class UserNotRegisteredError extends Error {
  constructor(email: string) {
    super(`Nenhuma conta encontrada com o e-mail "${email}".`);
    this.name = "UserNotRegisteredError";
  }
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const BCRYPT_SALT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------

export async function authenticateUser(
  email: string,
  password: string
): Promise<SafeUser> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Buscar usuário pelo e-mail (com hash da senha)
  const user = await UserRepository.findByEmail(normalizedEmail);
  if (!user) {
    throw new UserNotRegisteredError(normalizedEmail);
  }

  // 2. Comparar senha
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new InvalidCredentialsError();
  }

  // 3. Retornar sem passwordHash
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createUser(dto: CreateUserDTO): Promise<SafeUser> {
  // 1. Normalizar e-mail
  const normalizedEmail = dto.email.trim().toLowerCase();

  // 2. Verificar duplicidade de e-mail
  const existing = await UserRepository.findByEmail(normalizedEmail);
  if (existing) {
    throw new EmailAlreadyExistsError(normalizedEmail);
  }

  // 3. Criptografar senha
  const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

  // 4. Persistir
  const user = await UserRepository.create({
    name: dto.name.trim(),
    email: normalizedEmail,
    phone: dto.phone.trim(),
    passwordHash,
    role: dto.role,
  });

  // 5. Retornar sem passwordHash
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

export async function getUserById(id: string): Promise<SafeUser> {
  const user = await UserRepository.findById(id);
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
}

export async function listUsers(
  options?: PaginationOptions
): Promise<PaginatedResult<SafeUser>> {
  return UserRepository.findAll(options);
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updateUser(
  id: string,
  dto: UpdateUserDTO
): Promise<SafeUser> {
  // 1. Verificar existência
  const existing = await UserRepository.findByIdFull(id);
  if (!existing) {
    throw new UserNotFoundError(id);
  }

  // 2. Se o e-mail está sendo alterado, verificar duplicidade
  if (dto.email && dto.email !== existing.email) {
    const emailTaken = await UserRepository.findByEmail(dto.email);
    if (emailTaken) {
      throw new EmailAlreadyExistsError(dto.email);
    }
  }

  // 3. Se a senha está sendo alterada, criptografar
  const updateData: Record<string, unknown> = {};
  if (dto.name) updateData.name = dto.name;
  if (dto.email) updateData.email = dto.email;
  if (dto.phone) updateData.phone = dto.phone;
  if (dto.password) {
    updateData.passwordHash = await bcrypt.hash(
      dto.password,
      BCRYPT_SALT_ROUNDS
    );
  }

  // 4. Persistir
  return UserRepository.update(id, updateData);
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deleteUser(id: string): Promise<SafeUser> {
  // Verificar existência antes de excluir
  const existing = await UserRepository.findById(id);
  if (!existing) {
    throw new UserNotFoundError(id);
  }

  return UserRepository.remove(id);
}
