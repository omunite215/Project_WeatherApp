import { describe, expect, it } from "vitest";

import {
  locationId,
  migrateSavedLocations,
} from "@/stores/saved-locations";

const jamnagar = {
  name: "Jamnagar",
  country: "IN",
  state: "Gujarat",
  lat: 22.4732,
  lon: 70.0552,
};

const london = {
  name: "London",
  country: "GB",
  state: null,
  lat: 51.5073,
  lon: -0.1276,
};

describe("migrateSavedLocations", () => {
  it("keeps valid entries unchanged", () => {
    const stored = { favorites: [jamnagar], recents: [london, jamnagar] };
    expect(migrateSavedLocations(stored)).toEqual(stored);
  });

  it("returns empty lists for junk input rather than throwing", () => {
    for (const input of [null, undefined, "corrupt", 42, []]) {
      expect(migrateSavedLocations(input)).toEqual({
        favorites: [],
        recents: [],
      });
    }
  });

  it("tolerates missing keys", () => {
    expect(migrateSavedLocations({ favorites: [jamnagar] })).toEqual({
      favorites: [jamnagar],
      recents: [],
    });
  });

  /** `LocationBootstrap` navigates to `recents[0]`; a bad record breaks it. */
  it("drops entries with out-of-range coordinates", () => {
    const result = migrateSavedLocations({
      recents: [
        { name: "Bad lat", country: "", state: null, lat: 999, lon: 0 },
        { name: "Bad lon", country: "", state: null, lat: 0, lon: -500 },
        london,
      ],
    });
    expect(result.recents).toEqual([london]);
  });

  it("drops entries with missing or non-numeric coordinates", () => {
    const result = migrateSavedLocations({
      recents: [
        { name: "No coords", country: "GB", state: null },
        { name: "String coords", lat: "51.5", lon: "-0.12" },
        { name: "NaN", lat: Number.NaN, lon: 0 },
        jamnagar,
      ],
    });
    expect(result.recents).toEqual([jamnagar]);
  });

  it("drops entries with an empty or missing name", () => {
    const result = migrateSavedLocations({
      recents: [
        { name: "", lat: 1, lon: 2 },
        { lat: 3, lon: 4 },
        london,
      ],
    });
    expect(result.recents).toEqual([london]);
  });

  it("repairs optional fields of the wrong type", () => {
    const result = migrateSavedLocations({
      recents: [{ name: "Odd", country: 7, state: 9, lat: 10, lon: 20 }],
    });
    expect(result.recents[0]).toEqual({
      name: "Odd",
      country: "",
      state: null,
      lat: 10,
      lon: 20,
    });
  });

  it("caps recents so a tampered file cannot grow the list", () => {
    const many = Array.from({ length: 40 }, (_, i) => ({
      ...london,
      name: `City ${i}`,
      lat: i,
    }));
    expect(migrateSavedLocations({ recents: many }).recents).toHaveLength(6);
  });

  it("keeps the surviving entries when only some are corrupt", () => {
    const result = migrateSavedLocations({
      recents: [london, { name: "Broken", lat: 500, lon: 0 }, jamnagar],
    });
    expect(result.recents).toEqual([london, jamnagar]);
  });
});

describe("locationId", () => {
  it("is stable for the same coordinates", () => {
    expect(locationId(london)).toBe(locationId({ ...london, name: "Renamed" }));
  });

  it("differs between places", () => {
    expect(locationId(london)).not.toBe(locationId(jamnagar));
  });

  it("ignores precision beyond four decimals", () => {
    expect(locationId({ ...london, lat: 51.50731 })).toBe(locationId(london));
  });
});
