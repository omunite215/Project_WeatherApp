/**
 * Shared responsive layout classes.
 *
 * Every dimension here appears in at least two files — a component and its
 * skeleton. Defining them once is what keeps the skeleton the same size as the
 * thing it stands in for; duplicating the strings is how they silently drift and
 * reintroduce layout shift.
 *
 * Tailwind's source scanner reads these string literals, so the classes are
 * generated even though they never appear inline in JSX.
 *
 * Breakpoint ladder (Tailwind 4 defaults):
 *   sm 40rem/640 · md 48rem/768 · lg 64rem/1024 · xl 80rem/1280 · 2xl 96rem/1536
 */

/**
 * Page width — full bleed, no centred column.
 *
 * A capped `max-w-*` with `mx-auto` is a reading-column pattern: it exists to
 * stop prose lines getting too long. This is a dashboard, where the content is
 * cards and a time-series chart, and both get *better* with width. Capping at
 * 80rem discarded roughly a third of a 1920px display.
 *
 * Line length is instead controlled where it actually matters — inside the
 * cards — and by the fixed sidebar in `MAIN_GRID` below.
 */
export const PAGE_CONTAINER = "w-full";

/**
 * Metrics beside chart.
 *
 * Splits at `lg`, not earlier: at `md` (768px) two columns would leave the chart
 * roughly 360px wide, too cramped to read six hours of data.
 *
 * From `xl` the metric column becomes a **fixed width** rather than a fraction.
 * Proportional columns mean every extra pixel of screen is split between the two
 * — but metric tiles stop improving past ~30rem, while the chart keeps getting
 * more readable. Pinning the sidebar sends all the surplus to the chart, which
 * is the only element that can use it.
 */
export const MAIN_GRID = [
  "grid grid-cols-1 gap-4",
  "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-5",
  "xl:grid-cols-[26rem_minmax(0,1fr)] xl:gap-6",
  "2xl:grid-cols-[30rem_minmax(0,1fr)]",
].join(" ");

/**
 * Hero banner. Grows with the viewport but keeps a floor so the overlaid
 * readings never collide on short landscape phones.
 */
export const HERO_HEIGHT = [
  "h-[42vh] min-h-72",
  "sm:h-[46vh] sm:min-h-80",
  "lg:h-[50vh]",
  "xl:h-[54vh]",
  "2xl:h-[56vh] 2xl:min-h-[34rem]",
].join(" ");

/**
 * Metric quadrant columns.
 *
 * Two while stacked, three through the `md`–`lg` band where the card spans the
 * full page and three-across shortens it, then back to two once it is confined
 * to the narrow left column.
 */
export const METRIC_GRID_COLS = "grid-cols-2 md:grid-cols-3 lg:grid-cols-2";

/**
 * Chart plot area. Fixed heights rather than aspect ratio, because Recharts'
 * ResponsiveContainer needs a definite height from its parent.
 */
export const CHART_HEIGHT = "h-48 sm:h-56 lg:h-64 xl:h-72 2xl:h-80";

/**
 * Five day chips stay on one row at every width. A 3-column grid would wrap five
 * items to 3 + 2 and read as broken; shrinking the padding instead keeps the row
 * intact down to a 320px viewport.
 */
export const DAY_CHIP_GRID = "grid grid-cols-5 gap-1.5 sm:gap-2 xl:gap-3";

/** Matches the chip's internal padding so its skeleton is the same height. */
export const DAY_CHIP_HEIGHT = "h-[92px] sm:h-[104px] xl:h-[112px]";
