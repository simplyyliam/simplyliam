import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Add01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type FormEvent } from "react";
import {
  createProject,
  removeProjectAvatar,
  updateProject,
  uploadProjectAvatar,
} from "../data/projects";
import type {
  PortfolioProject,
  ProjectInput,
} from "../types/project";

const maxAvatarSize = 2 * 1024 * 1024;
const allowedAvatarTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

interface ProjectDialogProps {
  adminUserId: string;
  project?: PortfolioProject;
  onProjectSaved: (project: PortfolioProject) => void;
}

export function ProjectDialog({
  adminUserId,
  project,
  onProjectSaved,
}: ProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(project);
  const fieldId = project?.id ?? "new";

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

    const form = event.currentTarget;
    const formData = new FormData(form);
    const avatarEntry = formData.get("avatar");
    const avatarFile =
      avatarEntry instanceof File && avatarEntry.size > 0
        ? avatarEntry
        : null;

    let uploadedAvatar: Awaited<
      ReturnType<typeof uploadProjectAvatar>
    > | null = null;

    try {
      if (avatarFile) {
        if (!allowedAvatarTypes.has(avatarFile.type)) {
          throw new Error("Use a PNG, JPEG, WebP, or GIF image.");
        }

        if (avatarFile.size > maxAvatarSize) {
          throw new Error("The avatar image must be 2 MB or smaller.");
        }

        uploadedAvatar = await uploadProjectAvatar(
          avatarFile,
          adminUserId,
        );
      }

      const input: ProjectInput = {
        name: String(formData.get("name")).trim(),
        description: String(formData.get("description")).trim(),
        link: String(formData.get("link")).trim(),
        avatar_url:
          uploadedAvatar?.url ?? project?.avatar_url ?? null,
        avatar_path:
          uploadedAvatar?.path ?? project?.avatar_path ?? null,
      };

      const savedProject = project
        ? await updateProject(project.id, input)
        : await createProject(input);

      if (
        uploadedAvatar &&
        project?.avatar_path &&
        project.avatar_path !== uploadedAvatar.path
      ) {
        void removeProjectAvatar(project.avatar_path).catch(
          (cleanupError: unknown) => {
            console.error("Could not remove the old avatar.", cleanupError);
          },
        );
      }

      onProjectSaved(savedProject);
      form.reset();
      setIsOpen(false);
    } catch (caughtError) {
      if (uploadedAvatar) {
        void removeProjectAvatar(uploadedAvatar.path).catch(
          (cleanupError: unknown) => {
            console.error(
              "Could not roll back the avatar upload.",
              cleanupError,
            );
          },
        );
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `Could not ${isEditing ? "update" : "add"} the project.`,
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
            variant="ghost"
            size="icon-sm"
            aria-label={
              isEditing ? `Edit ${project?.name}` : "Add project"
            }
          />
        }
      >
        <HugeiconsIcon
          icon={isEditing ? PencilEdit02Icon : Add01Icon}
          strokeWidth={2}
        />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit project" : "Add project"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this project on your portfolio."
              : "Publish a project to your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`project-name-${fieldId}`}>
                Name
              </FieldLabel>
              <Input
                id={`project-name-${fieldId}`}
                name="name"
                className="text-base md:text-xs"
                autoComplete="off"
                defaultValue={project?.name}
                required
                maxLength={80}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`project-description-${fieldId}`}>
                Description
              </FieldLabel>
              <Textarea
                id={`project-description-${fieldId}`}
                name="description"
                className="text-base md:text-xs"
                defaultValue={project?.description}
                required
                maxLength={500}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`project-link-${fieldId}`}>
                Link
              </FieldLabel>
              <Input
                id={`project-link-${fieldId}`}
                name="link"
                className="text-base md:text-xs"
                type="url"
                inputMode="url"
                placeholder="https://example.com"
                defaultValue={project?.link}
                required
                maxLength={2048}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`project-avatar-${fieldId}`}>
                Avatar
              </FieldLabel>
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage
                    src={project?.avatar_url ?? "/favcon.png"}
                    alt=""
                  />
                  <AvatarFallback>
                    {project?.name.slice(0, 2).toUpperCase() ?? "PR"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id={`project-avatar-${fieldId}`}
                  name="avatar"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                />
              </div>
              <FieldDescription>
                Optional. PNG, JPEG, WebP, or GIF up to 2 MB.
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
              {isSaving
                ? isEditing
                  ? "Saving…"
                  : "Adding…"
                : isEditing
                  ? "Save changes"
                  : "Add project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
