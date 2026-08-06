import { describe, expect, it } from "vitest";

import {
  FALLBACK_LOCATION,
  formatLocationLabel,
  hasExplicitLocation,
  locationFromParams,
  locationToHref,
} from "@/lib/location";

/**
 * Gates automatic location detection: a false positive overrides a shared link,
 * a false negative re-prompts on every navigation.
 */
describe("hasExplicitLocation", () => {
  it("is true when both coordinates are present and valid", () => {
    expect(hasExplicitLocation({ lat: "22.47", lon: "70.05" })).toBe(true);
  });

  it("is false when the URL carries no coordinates", () => {
    expect(hasExplicitLocation({})).toBe(false);
  });

  it("is false when only one coordinate is present", () => {
    expect(hasExplicitLocation({ lat: "22.47" })).toBe(false);
    expect(hasExplicitLocation({ lon: "70.05" })).toBe(false);
  });

  it("is false for unparseable or out-of-range coordinates", () => {
    expect(hasExplicitLocation({ lat: "abc", lon: "70.05" })).toBe(false);
    expect(hasExplicitLocation({ lat: "91", lon: "0" })).toBe(false);
    expect(hasExplicitLocation({ lat: "0", lon: "181" })).toBe(false);
  });

  it("agrees with locationFromParams on the fallback path", () => {
    const params = { name: "Nowhere" };
    expect(hasExplicitLocation(params)).toBe(false);
    expect(locationFromParams(params)).toEqual(FALLBACK_LOCATION);
  });

  it("treats a round-tripped href as explicit", () => {
    const href = locationToHref({
      name: "Jamnagar",
      country: "IN",
      state: "Gujarat",
      lat: 22.4707,
      lon: 70.0577,
    });
    const params = Object.fromEntries(
      new URL(href, "https://example.test").searchParams,
    );
    expect(hasExplicitLocation(params)).toBe(true);
  });
});

describe("locationFromParams", () => {
  it("reads a complete location", () => {
    expect(
      locationFromParams({
        lat: "22.4707",
        lon: "70.0577",
        name: "Jamnagar",
        country: "IN",
        state: "Gujarat",
      }),
    ).toEqual({
      name: "Jamnagar",
      country: "IN",
      state: "Gujarat",
      lat: 22.4707,
      lon: 70.0577,
    });
  });

  /** A hand-edited URL should degrade to a working page, not an error. */
  it("falls back to the default when coordinates are missing", () => {
    expect(locationFromParams({})).toEqual(FALLBACK_LOCATION);
    expect(locationFromParams({ lat: "51.5" })).toEqual(FALLBACK_LOCATION);
  });

  it("falls back when coordinates are unparseable or out of range", () => {
    expect(locationFromParams({ lat: "abc", lon: "1" })).toEqual(
      FALLBACK_LOCATION,
    );
    expect(locationFromParams({ lat: "91", lon: "0" })).toEqual(
      FALLBACK_LOCATION,
    );
    expect(locationFromParams({ lat: "0", lon: "181" })).toEqual(
      FALLBACK_LOCATION,
    );
  });

  it("accepts the coordinate extremes", () => {
    expect(locationFromParams({ lat: "90", lon: "180" })).toMatchObject({
      lat: 90,
      lon: 180,
    });
    expect(locationFromParams({ lat: "-90", lon: "-180" })).toMatchObject({
      lat: -90,
      lon: -180,
    });
  });

  it("takes the first value when a param repeats", () => {
    expect(
      locationFromParams({ lat: ["10", "20"], lon: ["30", "40"] }),
    ).toMatchObject({ lat: 10, lon: 30 });
  });

  it("names an unlabelled coordinate pair rather than leaving it blank", () => {
    expect(locationFromParams({ lat: "10", lon: "20" }).name).toBe(
      "Selected location",
    );
  });
});

describe("locationToHref", () => {
  it("round-trips through locationFromParams", () => {
    const original = {
      name: "Jamnagar",
      country: "IN",
      state: "Gujarat",
      lat: 22.4707,
      lon: 70.0577,
    };

    const params = Object.fromEntries(
      new URL(locationToHref(original), "https://example.test").searchParams,
    );

    expect(locationFromParams(params)).toEqual(original);
  });

  it("omits empty optional parts", () => {
    const href = locationToHref({
      name: "Somewhere",
      country: "",
      state: null,
      lat: 1,
      lon: 2,
    });

    expect(href).not.toContain("country=");
    expect(href).not.toContain("state=");
  });

  it("encodes names containing spaces", () => {
    expect(
      locationToHref({
        name: "New York",
        country: "US",
        state: null,
        lat: 40.7128,
        lon: -74.006,
      }),
    ).toContain("name=New+York");
  });
});

describe("formatLocationLabel", () => {
  it("joins the parts that are present", () => {
    expect(
      formatLocationLabel({ name: "Jamnagar", state: "Gujarat", country: "IN" }),
    ).toBe("Jamnagar, Gujarat, IN");
  });

  it("skips absent parts without leaving stray separators", () => {
    expect(formatLocationLabel({ name: "London", country: "GB" })).toBe(
      "London, GB",
    );
    expect(
      formatLocationLabel({ name: "Atlantis", state: null, country: "" }),
    ).toBe("Atlantis");
  });
});
