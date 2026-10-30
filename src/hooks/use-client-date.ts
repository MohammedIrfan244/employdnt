"use client";

import { useSyncExternalStore } from "react";
import {
  getClientDateString,
  formatClientDate,
  formatClientTime,
  isClientDateToday,
  getRelativeDayDifference,
} from "@/lib/date-utils";

const emptySubscribe = () => () => {};

export function useClientDate() {
  // useSyncExternalStore is React 18/19's official way to detect client hydration
  // without triggering cascading renders or linter errors.
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const todayString = isClient ? getClientDateString(new Date()) : "";
  let timeZone = "UTC";
  if (isClient) {
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      timeZone = "UTC";
    }
  }

  return {
    isClient,
    todayString,
    timeZone,
    formatDate: (date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions) => {
      if (!isClient) return "";
      return formatClientDate(date, options);
    },
    formatTime: (date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions) => {
      if (!isClient) return "";
      return formatClientTime(date, options);
    },
    isToday: (date: Date | string) => {
      if (!isClient) return false;
      return isClientDateToday(date);
    },
    getRelativeDays: (date: Date | string) => {
      if (!isClient) return 0;
      return getRelativeDayDifference(date);
    },
  };
}
