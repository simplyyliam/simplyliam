import { useEffect, useState } from "react";
import { useAdminSession } from "@/features/main/hooks/useAdminSession";
import { getBannerUrl } from "../data/banner";
import { BannerDialog } from "./BannerDialog";

export const Banner = () => {
  const [url, setUrl] = useState("");
  const { isAdmin } = useAdminSession();

  useEffect(() => {
    let isActive = true;

    void getBannerUrl()
      .then((savedUrl) => {
        if (isActive) {
          setUrl(savedUrl ?? "");
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
    <div className="relative h-56 w-full min-w-0 shrink-0 sm:h-72 lg:h-89.5">
      <div className="isolate size-full overflow-hidden bg-neutral-50 [contain:paint] sm:rounded-2xl sm:[clip-path:inset(0_round_1rem)]">
        {url ? (
          <iframe
            className="block size-full border-0 sm:[clip-path:inset(0_round_1rem)]"
            src={url}
            title="Portfolio banner"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            Banner
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="absolute right-3 bottom-3 z-10">
          <BannerDialog url={url} onUrlSaved={setUrl} />
        </div>
      )}
    </div>
  );
};
