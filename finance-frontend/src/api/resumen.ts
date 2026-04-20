import { apiClient } from "./client";
import type { ID, ResumenComparativa, ResumenPeriodo } from "../types/models";

export async function getResumen(periodoId: ID): Promise<ResumenPeriodo> {
  const response = await apiClient.get<ResumenPeriodo>(`/resumen/${periodoId}`);
  return response.data;
}

export async function getResumenComparativa(
  periodoId: ID,
): Promise<ResumenComparativa> {
  const response = await apiClient.get<ResumenComparativa>(
    `/resumen/${periodoId}/comparativa`,
  );
  return response.data;
}
