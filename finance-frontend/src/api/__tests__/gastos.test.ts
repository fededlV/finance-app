import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it } from "@jest/globals";

import {
  createGasto,
  deleteGasto,
  getGastoById,
  getGastos,
  replaceGasto,
  updateGasto,
} from "../gastos";
import { apiClient } from "../client";

describe("gastos api", () => {
  const mock = new MockAdapter(apiClient);

  afterEach(() => {
    mock.reset();
  });

  it("gets gastos with filters", async () => {
    const filters = {
      periodo_id: 1,
      categoria_id: 2,
      fecha_desde: "2026-04-01",
      fecha_hasta: "2026-04-30",
    };
    const gastos = [
      {
        id: 10,
        periodo_id: 1,
        categoria_id: 2,
        descripcion: "Cafe",
        monto: 2500,
        fecha: "2026-04-10",
      },
    ];

    mock.onGet("/gastos").reply(200, { data: gastos });

    const result = await getGastos(filters);

    expect(result).toEqual(gastos);
    expect(mock.history.get[0].params).toEqual(filters);
  });

  it("gets a gasto by id", async () => {
    const gasto = {
      id: 15,
      periodo_id: 1,
      categoria_id: 3,
      descripcion: "Supermercado",
      monto: 12000,
      fecha: "2026-04-12",
    };

    mock.onGet("/gastos/15").reply(200, { data: gasto });

    const result = await getGastoById(15);

    expect(result).toEqual(gasto);
  });

  it("creates a gasto", async () => {
    const payload = {
      periodo_id: 1,
      categoria_id: 2,
      descripcion: "Taxi",
      monto: 5000,
      fecha: "2026-04-13",
      nota: "ida al trabajo",
    };
    const created = { id: 20, ...payload };

    mock.onPost("/gastos").reply(201, { data: created });

    const result = await createGasto(payload);

    expect(result).toEqual(created);
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });

  it("replaces a gasto", async () => {
    const payload = {
      periodo_id: 1,
      categoria_id: 2,
      descripcion: "Taxi nocturno",
      monto: 6200,
      fecha: "2026-04-13",
      nota: "vuelta a casa",
    };
    const replaced = { id: 20, ...payload };

    mock.onPut("/gastos/20").reply(200, { data: replaced });

    const result = await replaceGasto(20, payload);

    expect(result).toEqual(replaced);
    expect(JSON.parse(mock.history.put[0].data)).toEqual(payload);
  });

  it("updates a gasto partially", async () => {
    const payload = {
      descripcion: "Taxi app",
      monto: 6400,
    };
    const updated = {
      id: 20,
      periodo_id: 1,
      categoria_id: 2,
      descripcion: "Taxi app",
      monto: 6400,
      fecha: "2026-04-13",
    };

    mock.onPatch("/gastos/20").reply(200, { data: updated });

    const result = await updateGasto(20, payload);

    expect(result).toEqual(updated);
    expect(JSON.parse(mock.history.patch[0].data)).toEqual(payload);
  });

  it("deletes a gasto", async () => {
    mock.onDelete("/gastos/20").reply(204);

    await expect(deleteGasto(20)).resolves.toBeUndefined();
    expect(mock.history.delete[0].url).toBe("/gastos/20");
  });
});
