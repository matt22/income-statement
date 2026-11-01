import { describe, expect, it } from "vitest";
import { GET } from "@/app/income-statement/route";

describe("GET /income-statement", () => {
  it("returns the statement for a valid date range", async () => {
    const response = GET(new Request("http://localhost/income-statement?start=2026-01-01&end=2026-03-31"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.company).toBe("Northwind Coffee Roasters");
    expect(body.netIncomeCents).toBe(-4_448_014);
  });

  it.each([
    "http://localhost/income-statement",
    "http://localhost/income-statement?start=2026-03-31&end=2026-01-01",
    "http://localhost/income-statement?start=2026-02-31&end=2026-03-01",
  ])("rejects invalid date range: %s", async (url) => {
    const response = GET(new Request(url));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Provide a valid inclusive date range using start=YYYY-MM-DD and end=YYYY-MM-DD.",
    });
  });
});
