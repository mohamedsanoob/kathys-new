"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const CAMPAIGN_ATTRIBUTION_KEY = "kathysCampaignAttribution";
const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type CampaignAttribution = {
  campaignId: string;
  campaignName: string;
  source: "whatsapp";
  medium: "campaign";
  clickedAt: string;
};

export function readCampaignAttribution(): CampaignAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(CAMPAIGN_ATTRIBUTION_KEY) || "null"
    ) as CampaignAttribution | null;
    if (!stored?.campaignId || stored.source !== "whatsapp") return null;
    const clickedAt = new Date(stored.clickedAt).getTime();
    if (!Number.isFinite(clickedAt) || Date.now() - clickedAt > ATTRIBUTION_TTL_MS) {
      window.localStorage.removeItem(CAMPAIGN_ATTRIBUTION_KEY);
      return null;
    }
    return stored;
  } catch {
    window.localStorage.removeItem(CAMPAIGN_ATTRIBUTION_KEY);
    return null;
  }
}

export default function CampaignAttributionTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const campaignId = String(searchParams.get("campaign_id") || "").trim();
    if (
      !campaignId ||
      searchParams.get("utm_source") !== "whatsapp" ||
      searchParams.get("utm_medium") !== "campaign"
    ) return;

    const attribution: CampaignAttribution = {
      campaignId: campaignId.slice(0, 128),
      campaignName: String(searchParams.get("utm_campaign") || "").slice(0, 200),
      source: "whatsapp",
      medium: "campaign",
      clickedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(CAMPAIGN_ATTRIBUTION_KEY, JSON.stringify(attribution));
  }, [searchParams]);

  return null;
}
