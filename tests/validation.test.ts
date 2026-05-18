import { describe, expect, it } from "vitest";
import { validatePhysical4KRelease } from "../src/lib/validation";
import type { PhysicalReleaseCandidate } from "../src/types";

const baseCandidate: PhysicalReleaseCandidate = {
  provider: "Test Provider",
  providerId: "abc",
  title: "Heat",
  year: 1995,
  format: "4K UHD Blu-ray",
  mediaType: "physical",
  upc: "786936893033",
  releaseTitle: "Heat 4K UHD",
  labelOrDistributor: "Disney",
  country: "US",
  releaseDate: "2022-08-09",
  raw: {}
};

describe("validatePhysical4KRelease", () => {
  it("confirms physical 4K UHD Blu-ray releases with release-specific identifiers", () => {
    const result = validatePhysical4KRelease(baseCandidate);

    expect(result.isPhysical4K).toBe(true);
    expect(result.status).toBe("confirmed");
    expect(result.confidence).toBeGreaterThanOrEqual(90);
    expect(result.reasons).toContain("Physical media product");
  });

  it("rejects digital and DVD-only products", () => {
    const result = validatePhysical4KRelease({
      ...baseCandidate,
      mediaType: "digital",
      format: "DVD"
    });

    expect(result.isPhysical4K).toBe(false);
    expect(result.status).toBe("rejected");
    expect(result.warnings.join(" ")).toMatch(/digital|DVD/i);
  });

  it("requires manual confirmation for ambiguous fallback results", () => {
    const result = validatePhysical4KRelease({
      ...baseCandidate,
      provider: "UPCitemdb",
      format: "Movie",
      mediaType: "unknown",
      upc: undefined,
      labelOrDistributor: undefined
    });

    expect(result.status).toBe("unverified");
    expect(result.isPhysical4K).toBe(false);
  });
});
