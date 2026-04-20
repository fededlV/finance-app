import { apiClient, unwrapData } from "./client";
import type {
  ApiResponse,
  CreatePresupuestoInput,
  ID,
  Presupuesto,
  PresupuestoFilters,
  UpdatePresupuestoInput,
} from "../types/models";

export async function getPresupuestos(
  filters?: PresupuestoFilters,
): Promise<Presupuesto[]> {
  const response = await apiClient.get<ApiResponse<Presupuesto[]>>(
    "/presupuestos",
    {
      params: filters,
    },
  );
  return unwrapData(response);
}

export async function createPresupuesto(
  payload: CreatePresupuestoInput,
): Promise<Presupuesto> {
  const response = await apiClient.post<ApiResponse<Presupuesto>>(
    "/presupuestos",
    payload,
  );
  return unwrapData(response);
}

export async function updatePresupuesto(
  presupuestoId: ID,
  payload: UpdatePresupuestoInput,
): Promise<Presupuesto> {
  const response = await apiClient.patch<ApiResponse<Presupuesto>>(
    `/presupuestos/${presupuestoId}`,
    payload,
  );
  return unwrapData(response);
}

export async function deletePresupuesto(presupuestoId: ID): Promise<void> {
  await apiClient.delete(`/presupuestos/${presupuestoId}`);
}
