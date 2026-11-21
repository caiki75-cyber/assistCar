/**
 * ServiceTypeService — regras de negócio do módulo ServiceType.
 *
 * Orquestra chamadas ao repository.
 * NÃO executa consultas Prisma diretamente.
 */

import * as ServiceTypeRepository from "./service-type.repository";
import type {
  ServiceTypePublic,
  PaginationOptions,
  PaginatedResult,
} from "./service-type.types";

// ---------------------------------------------------------------------------
// Erros de domínio
// ---------------------------------------------------------------------------

export class ServiceTypeNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Tipo de serviço não encontrado: ${identifier}`);
    this.name = "ServiceTypeNotFoundError";
  }
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

export async function listServiceTypes(
  options?: PaginationOptions
): Promise<PaginatedResult<ServiceTypePublic>> {
  return ServiceTypeRepository.findAll(options);
}

export async function getServiceTypeById(
  id: string
): Promise<ServiceTypePublic> {
  const serviceType = await ServiceTypeRepository.findById(id);
  if (!serviceType) {
    throw new ServiceTypeNotFoundError(id);
  }
  return serviceType;
}
