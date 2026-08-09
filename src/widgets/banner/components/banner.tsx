import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAdminSession } from "@/features/main/hooks/useAdminSession";
import {
  getBannerSettings,
  type BannerSettings,
} from "../data/banner";
import { BannerDialog } from "./BannerDialog";

const emptyBanner: BannerSettings = {
  url: "",
  sourceType: "embed",
  assetPath: null,
};

interface BannerProps {
  fallbackLabel?: string;
  fallbackEditor?: ReactNode;
}

export const Banner = ({
  fallbackLabel = "Banner",
  fallbackEditor,
}: BannerProps) => {
  const [settings, setSettings] =
    useState<BannerSettings>(emptyBanner);
  const { isAdmin, session } = useAdminSession();
  const adminUserId = isAdmin ? session?.user.id : undefined;

  useEffect(() => {
    let isActive = true;

    void getBannerSettings()
      .then((savedSettings) => {
        if (isActive) {
          setSettings(savedSettings);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load the banner link.", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="relative size-full min-w-0">
      <div className="isolate size-full overflow-hidden bg-neutral-50 [contain:paint] sm:rounded-2xl sm:[clip-path:inset(0_round_1rem)]">
        {settings.sourceType === "image" && settings.url ? (
          <img
            className="size-full object-cover"
            src={settings.url}
            alt=""
          />
        ) : settings.sourceType === "video" && settings.url ? (
          <video
            className="size-full object-cover"
            src={settings.url}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : settings.url ? (
          <iframe
            className="block size-full border-0 sm:[clip-path:inset(0_round_1rem)]"
            src={settings.url}
            title="Portfolio banner"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            {fallbackEditor ?? fallbackLabel}
          </div>
        )}
      </div>

      {adminUserId && (
        <div className="absolute right-3 bottom-3 z-10">
          <BannerDialog
            adminUserId={adminUserId}
            settings={settings}
            onSettingsSaved={setSettings}
          />
        </div>
      )}
    </div>
  );
};
