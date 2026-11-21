/**
 * DTOs de validação para o módulo User.
 *
 * Responsáveis por validar e restringir os dados recebidos
 * nas requisições HTTP, impedindo que o cliente envie
 * campos internos como `id`, `passwordHash` ou `role` admin.
 */

import { Role } from "@/app/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Helpers de validação
// ---------------------------------------------------------------------------

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// ---------------------------------------------------------------------------
// DTO de criação
// ---------------------------------------------------------------------------

export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: typeof Role.USER | typeof Role.WORKER;
}

export function validateCreateUserDTO(
  body: unknown
): ValidationResult<CreateUserDTO> {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return { success: false, errors: [{ field: "body", message: "Corpo da requisição inválido." }] };
  }

  if (!isNonEmptyString(data.name)) {
    errors.push({ field: "name", message: "Nome é obrigatório." });
  }

  if (!isNonEmptyString(data.email) || !isValidEmail(data.email as string)) {
    errors.push({ field: "email", message: "E-mail inválido." });
  }

  if (!isNonEmptyString(data.phone)) {
    errors.push({ field: "phone", message: "Telefone é obrigatório." });
  }

  if (!isNonEmptyString(data.password) || (data.password as string).length < 8) {
    errors.push({
      field: "password",
      message: "Senha deve ter no mínimo 8 caracteres.",
    });
  }

  // Validar role: aceita apenas USER ou WORKER; ADMIN não é permitido via API pública.
  if (data.role !== undefined) {
    if (data.role !== Role.USER && data.role !== Role.WORKER) {
      errors.push({
        field: "role",
        message: "Role inválido. Valores aceitos: USER, WORKER.",
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: (data.name as string).trim(),
      email: (data.email as string).trim().toLowerCase(),
      phone: (data.phone as string).trim(),
      password: data.password as string,
      role: (data.role as CreateUserDTO["role"]) ?? Role.USER,
    },
  };
}

// ---------------------------------------------------------------------------
// DTO de atualização
// ---------------------------------------------------------------------------

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export function validateUpdateUserDTO(
  body: unknown
): ValidationResult<UpdateUserDTO> {
  const errors: ValidationError[] = [];
  const data = body as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    return { success: false, errors: [{ field: "body", message: "Corpo da requisição inválido." }] };
  }

  const result: UpdateUserDTO = {};
  let hasField = false;

  if (data.name !== undefined) {
    if (!isNonEmptyString(data.name)) {
      errors.push({ field: "name", message: "Nome não pode ser vazio." });
    } else {
      result.name = (data.name as string).trim();
      hasField = true;
    }
  }

  if (data.email !== undefined) {
    if (!isNonEmptyString(data.email) || !isValidEmail(data.email as string)) {
      errors.push({ field: "email", message: "E-mail inválido." });
    } else {
      result.email = (data.email as string).trim().toLowerCase();
      hasField = true;
    }
  }

  if (data.phone !== undefined) {
    if (!isNonEmptyString(data.phone)) {
      errors.push({ field: "phone", message: "Telefone não pode ser vazio." });
    } else {
      result.phone = (data.phone as string).trim();
      hasField = true;
    }
  }

  if (data.password !== undefined) {
    if (!isNonEmptyString(data.password) || (data.password as string).length < 8) {
      errors.push({
        field: "password",
        message: "Senha deve ter no mínimo 8 caracteres.",
      });
    } else {
      result.password = data.password as string;
      hasField = true;
    }
  }

  if (!hasField && errors.length === 0) {
    errors.push({
      field: "body",
      message: "Nenhum campo para atualizar foi fornecido.",
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: result };
}
