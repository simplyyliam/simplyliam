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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type FormEvent } from "react";
import { updateBannerUrl } from "../data/banner";

interface BannerDialogProps {
  url: string;
  onUrlSaved: (url: string) => void;
}

export function BannerDialog({
  url,
  onUrlSaved,
}: BannerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setError("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const nextUrl = String(formData.get("url")).trim();

    try {
      const savedUrl = await updateBannerUrl(nextUrl);
      onUrlSaved(savedUrl);
      setIsOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update the banner link.",
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
            aria-label="Edit banner link"
          />
        }
      >
        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit banner link</DialogTitle>
          <DialogDescription>
            Paste the page you want to display inside the banner.
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
                defaultValue={url}
                required
                maxLength={2048}
              />
            </Field>

            {error && (
              <Field data-invalid>
                <FieldError>{error}</FieldError>
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
