import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ImageUploadIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  removeBannerMedia,
  updateBannerSettings,
  uploadBannerMedia,
  type BannerSettings,
} from "../data/banner";

interface BannerDialogProps {
  adminUserId: string;
  settings: BannerSettings;
  onSettingsSaved: (settings: BannerSettings) => void;
}

const maxBannerSize = 20 * 1024 * 1024;
const acceptedBannerTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

export function BannerDialog({
  adminUserId,
  settings,
  onSettingsSaved,
}: BannerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setError("");
      setIsDragging(false);
      setSelectedFile(null);
    }
  }

  function selectFile(file: File | undefined) {
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!acceptedBannerTypes.has(file.type)) {
      setError(
        "Use a GIF, PNG, JPEG, WebP, MP4, or WebM file.",
      );
      return;
    }

    if (file.size > maxBannerSize) {
      setError("The banner file must be 20 MB or smaller.");
      return;
    }

    setSelectedFile(file);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const nextUrl = String(formData.get("url")).trim();
    let uploadedMedia: Awaited<
      ReturnType<typeof uploadBannerMedia>
    > | null = null;

    try {
      if (selectedFile) {
        uploadedMedia = await uploadBannerMedia(
          selectedFile,
          adminUserId,
        );
      }

      if (!uploadedMedia && !nextUrl && !settings.url) {
        throw new Error("Add an embed URL or choose a media file.");
      }

      const savedSettings = await updateBannerSettings(
        uploadedMedia
          ? {
              url: uploadedMedia.url,
              sourceType: uploadedMedia.sourceType,
              assetPath: uploadedMedia.path,
            }
          : nextUrl
            ? {
                url: nextUrl,
                sourceType: "embed",
                assetPath: null,
              }
            : settings,
      );

      if (
        settings.assetPath &&
        settings.assetPath !== savedSettings.assetPath
      ) {
        void removeBannerMedia(settings.assetPath).catch(
          (cleanupError: unknown) => {
            console.error(
              "Could not remove the old banner file.",
              cleanupError,
            );
          },
        );
      }

      onSettingsSaved(savedSettings);
      setIsOpen(false);
    } catch (caughtError) {
      if (uploadedMedia) {
        void removeBannerMedia(uploadedMedia.path).catch(
          (cleanupError: unknown) => {
            console.error(
              "Could not roll back the banner upload.",
              cleanupError,
            );
          },
        );
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update the banner.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Edit banner"
          />
        }
      >
        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit banner</DialogTitle>
          <DialogDescription>
            Paste an embeddable page or upload your own animated media.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="banner-url">Banner URL</FieldLabel>
              <Input
                id="banner-url"
                name="url"
                className="text-base md:text-xs"
                type="url"
                inputMode="url"
                placeholder="https://example.com"
                defaultValue={
                  settings.sourceType === "embed"
                    ? settings.url
                    : ""
                }
                maxLength={2048}
              />
            </Field>

            <FieldSeparator>or</FieldSeparator>

            <Field>
              <FieldLabel
                htmlFor="banner-file"
                className={cn(
                  "flex min-h-28 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed px-4 text-center transition-colors",
                  isDragging &&
                    "border-ring bg-accent text-accent-foreground",
                )}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <span className="flex flex-col items-center gap-2">
                  <HugeiconsIcon
                    icon={ImageUploadIcon}
                    strokeWidth={1.8}
                  />
                  <span>
                    {selectedFile
                      ? selectedFile.name
                      : "Drop a GIF, image, or video here"}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    or click to choose a file
                  </span>
                </span>
              </FieldLabel>
              <Input
                id="banner-file"
                className="sr-only"
                type="file"
                accept="image/gif,image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={(event) =>
                  selectFile(event.currentTarget.files?.[0])
                }
              />
              <FieldDescription>
                GIF, PNG, JPEG, WebP, MP4, or WebM up to 20 MB.
              </FieldDescription>
            </Field>

            {error && (
              <Field data-invalid>
                <FieldError>{error}</FieldError>
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
