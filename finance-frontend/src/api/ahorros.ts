import { apiClient, unwrapData } from "./client";
import type {
  Ahorro,
  AhorroFilters,
  ApiResponse,
  CreateAhorroInput,
  ID,
  UpdateAhorroInput,
} from "../types/models";

export async function getAhorros(filters?: AhorroFilters): Promise<Ahorro[]> {
  const response = await apiClient.get<ApiResponse<Ahorro[]>>("/ahorros", {
    params: filters,
  });
  return unwrapData(response);
}

export async function getAhorroById(ahorroId: ID): Promise<Ahorro> {
  const response = await apiClient.get<ApiResponse<Ahorro>>(
    `/ahorros/${ahorroId}`,
  );
  return unwrapData(response);
}

export async function createAhorro(payload: CreateAhorroInput): Promise<Ahorro> {
  const response = await apiClient.post<ApiResponse<Ahorro>>("/ahorros", payload);
  return unwrapData(response);
}

export async function updateAhorro(
  ahorroId: ID,
  payload: UpdateAhorroInput,
): Promise<Ahorro> {
  const response = await apiClient.patch<ApiResponse<Ahorro>>(
    `/ahorros/${ahorroId}`,
    payload,
  );
  return unwrapData(response);
}

export async function deleteAhorro(ahorroId: ID): Promise<void> {
  await apiClient.delete(`/ahorros/${ahorroId}`);
}
