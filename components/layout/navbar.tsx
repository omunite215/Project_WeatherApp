"use client";

import Image from "next/image";
import Link from "next/link";

import { CitySearch } from "@/components/layout/city-search";
import { FavoritesMenu } from "@/components/layout/favorites-menu";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UnitToggle } from "@/components/layout/unit-toggle";
import { PAGE_CONTAINER } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { SavedLocation } from "@/types/domain";

export function Navbar({ location }: { location: SavedLocation }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <nav
        className={cn(
          "padding-x flex items-center gap-3 py-3 xl:gap-4 xl:py-4",
          PAGE_CONTAINER,
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Omi's Weather home"
        >
          <Image
            src="/logo/logo.svg"
            width={40}
            height={40}
            alt=""
            priority
            className="size-9 sm:size-10"
          />
          {/* Wordmark waits for `md`: at `sm` it competes with the search box. */}
          <span className="hidden text-lg font-semibold md:inline-block xl:text-xl">
            Omi&apos;s Weather
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 justify-center">
          <CitySearch />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <UnitToggle />
          </div>
          <FavoritesMenu current={location} />
          <ModeToggle />
        </div>
      </nav>

      {/* Below `sm` the unit toggle moves to its own row rather than crowding
          the logo and search into an unusable strip. */}
      <div
        className={cn(
          "padding-x flex justify-end pb-2 sm:hidden",
          PAGE_CONTAINER,
        )}
      >
        <UnitToggle />
      </div>
    </header>
  );
}
