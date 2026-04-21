import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it } from "@jest/globals";

import { apiClient, unwrapData } from "../client";

describe("api client", () => {
  const mock = new MockAdapter(apiClient);

  afterEach(() => {
    mock.reset();
  });

  it("unwrapData returns the inner data payload", () => {
    const data = { id: 1, descripcion: "test" };
    const response = {
      data: { data },
    } as any;

    expect(unwrapData(response)).toEqual(data);
  });

  it("normalizes API errors with error and details fields", async () => {
    mock.onGet("/error").reply(400, {
      error: "Invalid request",
      details: { field: "monto" },
    });

    await expect(apiClient.get("/error")).rejects.toMatchObject({
      message: "Invalid request",
      status: 400,
      details: { field: "monto" },
    });
  });

  it("keeps non-normalized errors as-is", async () => {
    mock.onGet("/network-error").networkError();

    await expect(apiClient.get("/network-error")).rejects.toHaveProperty(
      "message",
      "Network Error",
    );
  });
});
