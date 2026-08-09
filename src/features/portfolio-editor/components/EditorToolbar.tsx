import { Button } from "@/components/ui/button"

interface EditorToolbarProps {
  isEditing: boolean
  hasChanges: boolean
  isPublishing: boolean
  onToggleEditing: () => void
  onDiscardChanges: () => void
  onPublish: () => void
}

export function EditorToolbar({ isEditing, hasChanges, isPublishing, onToggleEditing, onDiscardChanges, onPublish }: EditorToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Portfolio editor"
      className="fixed right-4 bottom-1/4 z-40 flex items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur"
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
