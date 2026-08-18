"use client";

import { useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent";

export function useConsent() {
  return useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  );
}
