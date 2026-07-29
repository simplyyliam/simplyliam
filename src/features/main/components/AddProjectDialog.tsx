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
import { Textarea } from "@/components/ui/textarea";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type FormEvent } from "react";
import { createProject } from "../data/projects";
import type { PortfolioProject } from "../types/project";

interface AddProjectDialogProps {
  onProjectAdded: (project: PortfolioProject) => void;
}

export function AddProjectDialog({
  onProjectAdded,
}: AddProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const project = await createProject({
        name: String(formData.get("name")).trim(),
        description: String(formData.get("description")).trim(),
        link: String(formData.get("link")).trim(),
      });

      onProjectAdded(project);
      form.reset();
      setIsOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not add the project.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Add project"
          />
        }
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>
            Publish a project to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="project-name">Name</FieldLabel>
              <Input
                id="project-name"
                name="name"
                className="text-base md:text-xs"
                autoComplete="off"
                required
                maxLength={80}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="project-description">
                Description
              </FieldLabel>
              <Textarea
                id="project-description"
                name="description"
                className="text-base md:text-xs"
                required
                maxLength={500}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="project-link">Link</FieldLabel>
              <Input
                id="project-link"
                name="link"
                className="text-base md:text-xs"
                type="url"
                inputMode="url"
                placeholder="https://example.com"
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
              {isSaving ? "Adding…" : "Add project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
