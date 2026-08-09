import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { PortfolioBlock } from "../types/portfolio"

interface EditorToolbarProps {
  isEditing: boolean
  hasChanges: boolean
  isPublishing: boolean
  onToggleEditing: () => void
  onDiscardChanges: () => void
  onPublish: () => void
  sections: PortfolioBlock[]
  onSectionVisibilityChange: (sectionId: string, visible: boolean) => void
}

export function EditorToolbar({ isEditing, hasChanges, isPublishing, onToggleEditing, onDiscardChanges, onPublish, sections, onSectionVisibilityChange }: EditorToolbarProps) {
  const visibleSectionCount = sections.filter((section) => section.visible).length

  return (
    <div
      role="toolbar"
      aria-label="Portfolio editor"
      className="fixed right-3 bottom-3 left-3 z-40 flex flex-wrap items-center justify-end gap-2 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur sm:right-4 sm:bottom-1/4 sm:left-auto"
    >
      <Button
        type="button"
        variant="outline"
        aria-pressed={isEditing}
        onClick={onToggleEditing}
      >
        {isEditing ? "Preview" : "Edit layout"}
      </Button>
      {isEditing && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="outline" />}
            >
              Sections
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Visible sections</DropdownMenuLabel>
                {sections.map((section) => (
                  <DropdownMenuCheckboxItem
                    key={section.id}
                    checked={section.visible}
                    disabled={section.visible && visibleSectionCount === 1}
                    onCheckedChange={(checked) => {
                      onSectionVisibilityChange(section.id, checked)
                    }}
                    className="capitalize"
                  >
                    {section.type}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            disabled={!hasChanges || isPublishing}
            onClick={onDiscardChanges}
          >
            Discard changes
          </Button>

          <Button
            type="button"
            disabled={!hasChanges || isPublishing}
            onClick={onPublish}
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </Button>
        </>
      )}
    </div>
  )
}
