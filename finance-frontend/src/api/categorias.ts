import { apiClient, unwrapData } from "./client";
import type { ApiResponse, Categoria } from "../types/models";

export async function getCategorias(): Promise<Categoria[]> {
  const response = await apiClient.get<ApiResponse<Categoria[]>>("/categorias");
  return unwrapData(response);
}
