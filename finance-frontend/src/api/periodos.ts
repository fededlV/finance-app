import { apiClient, unwrapData } from "./client";
import type {
  ApiResponse,
  CreatePeriodoInput,
  ID,
  Periodo,
  UpdatePeriodoInput,
} from "../types/models";

export async function getPeriodos(): Promise<Periodo[]> {
  const response = await apiClient.get<ApiResponse<Periodo[]>>("/periodos");
  return unwrapData(response);
}

export async function getPeriodoActual(): Promise<Periodo> {
  const response = await apiClient.get<ApiResponse<Periodo>>("/periodos/actual");
  return unwrapData(response);
}

export async function getPeriodoById(periodoId: ID): Promise<Periodo> {
  const response = await apiClient.get<ApiResponse<Periodo>>(
    `/periodos/${periodoId}`,
  );
  return unwrapData(response);
}

export async function createPeriodo(payload: CreatePeriodoInput): Promise<Periodo> {
  const response = await apiClient.post<ApiResponse<Periodo>>("/periodos", payload);
  return unwrapData(response);
}

export async function updatePeriodo(
  periodoId: ID,
  payload: UpdatePeriodoInput,
): Promise<Periodo> {
  const response = await apiClient.patch<ApiResponse<Periodo>>(
    `/periodos/${periodoId}`,
    payload,
  );
  return unwrapData(response);
}
