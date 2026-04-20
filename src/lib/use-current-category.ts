"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  CATEGORY_COOKIE,
  DEFAULT_CATEGORY,
  isValidCategory,
  type PlatformCategory,
} from "./platforms";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

const subscribe = () => () => {};
const getCookieSnapshot = () => readCookie(CATEGORY_COOKIE);
const getServerSnapshot = () => null;

/**
 * Returns the user's current browsing category (web | mobile). URL takes
 * priority when on /catalog/[category], else cookie, else default.
 * Keeps the cookie in sync with the URL.
 */
export function useCurrentCategory(): PlatformCategory {
  const pathname = usePathname();
  const cookieValue = useSyncExternalStore(
    subscribe,
    getCookieSnapshot,
    getServerSnapshot
  );

  const category = useMemo<PlatformCategory>(() => {
    const urlMatch = pathname.match(/^\/catalog\/([^/]+)/);
    if (urlMatch && isValidCategory(urlMatch[1])) return urlMatch[1];
    if (cookieValue && isValidCategory(cookieValue)) return cookieValue;
    return DEFAULT_CATEGORY;
  }, [pathname, cookieValue]);

  useEffect(() => {
    const urlMatch = pathname.match(/^\/catalog\/([^/]+)/);
    if (urlMatch && isValidCategory(urlMatch[1])) {
      writeCookie(CATEGORY_COOKIE, urlMatch[1]);
    }
  }, [pathname]);

  return category;
}

export function setCurrentCategory(category: PlatformCategory) {
  writeCookie(CATEGORY_COOKIE, category);
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(CATEGORY_COOKIE, category);
    } catch {
      // localStorage quota / privacy mode — cookie still works
    }
  }
}
