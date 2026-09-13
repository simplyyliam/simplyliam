import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  alt?: string;
  className?: string;
};

export function Avatar({ src, alt, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "size-40 rounded-3xl bg-muted sm:size-56 sm:rounded-[2rem]",
        "overflow-hidden",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          className="size-full object-cover"
          loading="eager"
          decoding="async"
        />
      ) : null}
    </div>
  );
}
