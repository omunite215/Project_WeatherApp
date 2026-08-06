import { describe, expect, it } from "vitest";

import {
  clockParts,
  formatClock,
  formatRelativeTime,
  formatUtcOffset,
  formatWeekday,
  isDaytime,
  toCityDateKey,
} from "@/lib/format/time";

/** 2024-01-15T00:00:00Z, a Monday. */
const MONDAY_UTC_MIDNIGHT = 1_705_276_800;

const HOUR = 3600;

describe("clockParts", () => {
  /** `% 12` yields 0..11, so the meridiem must come from the 24-hour value. */
  it("assigns the meridiem from the 24-hour value, not the reduced one", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const parts = clockParts(MONDAY_UTC_MIDNIGHT + hour * HOUR, 0);
      expect(parts.hours24).toBe(hour);
      expect(parts.meridiem).toBe(hour >= 12 ? "PM" : "AM");
    }
  });

  it("renders midnight and noon as 12, never 0", () => {
    expect(clockParts(MONDAY_UTC_MIDNIGHT, 0).hours12).toBe(12);
    expect(clockParts(MONDAY_UTC_MIDNIGHT + 12 * HOUR, 0).hours12).toBe(12);
  });

  it("maps afternoon hours onto the 12-hour scale", () => {
    expect(clockParts(MONDAY_UTC_MIDNIGHT + 13 * HOUR, 0).hours12).toBe(1);
    expect(clockParts(MONDAY_UTC_MIDNIGHT + 23 * HOUR, 0).hours12).toBe(11);
  });
});

describe("formatClock", () => {
  it("formats 12-hour time with a padded minute", () => {
    expect(formatClock(MONDAY_UTC_MIDNIGHT + 19 * HOUR + 300, 0)).toBe(
      "7:05 PM",
    );
  });

  it("formats 24-hour time when asked", () => {
    expect(
      formatClock(MONDAY_UTC_MIDNIGHT + 19 * HOUR + 300, 0, { hour12: false }),
    ).toBe("19:05");
  });

  /** The city's offset must win, not the machine running the test. */
  it("uses the city's offset, independent of the host timezone", () => {
    // 00:00 UTC in Tokyo (UTC+9) is 09:00 local.
    expect(formatClock(MONDAY_UTC_MIDNIGHT, 9 * HOUR)).toBe("9:00 AM");
    // ...and 19:00 the previous day in New York (UTC-5).
    expect(formatClock(MONDAY_UTC_MIDNIGHT, -5 * HOUR)).toBe("7:00 PM");
  });

  it("handles half-hour offsets such as India (UTC+5:30)", () => {
    expect(formatClock(MONDAY_UTC_MIDNIGHT, 5.5 * HOUR)).toBe("5:30 AM");
  });

  it("handles Nepal's 45-minute offset (UTC+5:45)", () => {
    expect(formatClock(MONDAY_UTC_MIDNIGHT, 5.75 * HOUR)).toBe("5:45 AM");
  });
});

describe("formatWeekday", () => {
  it("names the day in the city's local time", () => {
    expect(formatWeekday(MONDAY_UTC_MIDNIGHT, 0)).toBe("Monday");
  });

  it("rolls back a day for negative offsets that cross midnight", () => {
    expect(formatWeekday(MONDAY_UTC_MIDNIGHT, -5 * HOUR)).toBe("Sunday");
  });

  it("rolls forward for positive offsets that cross midnight", () => {
    expect(formatWeekday(MONDAY_UTC_MIDNIGHT + 20 * HOUR, 9 * HOUR)).toBe(
      "Tuesday",
    );
  });
});

describe("toCityDateKey", () => {
  it("produces a zero-padded local date", () => {
    expect(toCityDateKey(MONDAY_UTC_MIDNIGHT, 0)).toBe("2024-01-15");
  });

  it("groups by the city's calendar day, not UTC's", () => {
    expect(toCityDateKey(MONDAY_UTC_MIDNIGHT, -5 * HOUR)).toBe("2024-01-14");
  });
});

describe("formatUtcOffset", () => {
  it("formats whole-hour offsets", () => {
    expect(formatUtcOffset(0)).toBe("UTC+0");
    expect(formatUtcOffset(9 * HOUR)).toBe("UTC+9");
    expect(formatUtcOffset(-5 * HOUR)).toBe("UTC-5");
  });

  it("formats fractional offsets", () => {
    expect(formatUtcOffset(5.5 * HOUR)).toBe("UTC+5:30");
    expect(formatUtcOffset(-3.5 * HOUR)).toBe("UTC-3:30");
  });
});

describe("formatRelativeTime", () => {
  const now = 1_705_276_800_000;

  it("describes recent timestamps as 'just now'", () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe("just now");
  });

  it("scales through minutes, hours and days", () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe("5m ago");
    expect(formatRelativeTime(now - 3 * 3_600_000, now)).toBe("3h ago");
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe("2d ago");
  });

  it("clamps future timestamps rather than reporting negative time", () => {
    expect(formatRelativeTime(now + 60_000, now)).toBe("just now");
  });
});

describe("isDaytime", () => {
  const sunrise = MONDAY_UTC_MIDNIGHT + 6 * HOUR;
  const sunset = MONDAY_UTC_MIDNIGHT + 18 * HOUR;

  it("is true between sunrise and sunset", () => {
    expect(isDaytime(MONDAY_UTC_MIDNIGHT + 12 * HOUR, sunrise, sunset)).toBe(
      true,
    );
  });

  it("is false before sunrise and after sunset", () => {
    expect(isDaytime(MONDAY_UTC_MIDNIGHT + 3 * HOUR, sunrise, sunset)).toBe(
      false,
    );
    expect(isDaytime(MONDAY_UTC_MIDNIGHT + 21 * HOUR, sunrise, sunset)).toBe(
      false,
    );
  });
});
