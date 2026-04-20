import { apiClient, unwrapData } from "./client";
import type {
  ApiResponse,
  CreateGastoInput,
  Gasto,
  GastoFilters,
  ID,
  ReplaceGastoInput,
  UpdateGastoInput,
} from "../types/models";

export async function getGastos(filters?: GastoFilters): Promise<Gasto[]> {
  const response = await apiClient.get<ApiResponse<Gasto[]>>("/gastos", {
    params: filters,
  });
  return unwrapData(response);
}

export async function getGastoById(gastoId: ID): Promise<Gasto> {
  const response = await apiClient.get<ApiResponse<Gasto>>(`/gastos/${gastoId}`);
  return unwrapData(response);
}

export async function createGasto(payload: CreateGastoInput): Promise<Gasto> {
  const response = await apiClient.post<ApiResponse<Gasto>>("/gastos", payload);
  return unwrapData(response);
}

export async function replaceGasto(
  gastoId: ID,
  payload: ReplaceGastoInput,
): Promise<Gasto> {
  const response = await apiClient.put<ApiResponse<Gasto>>(
    `/gastos/${gastoId}`,
    payload,
  );
  return unwrapData(response);
}

export async function updateGasto(
  gastoId: ID,
  payload: UpdateGastoInput,
): Promise<Gasto> {
  const response = await apiClient.patch<ApiResponse<Gasto>>(
    `/gastos/${gastoId}`,
    payload,
  );
  return unwrapData(response);
}

export async function deleteGasto(gastoId: ID): Promise<void> {
  await apiClient.delete(`/gastos/${gastoId}`);
}
