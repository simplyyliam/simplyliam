import { Tag } from "./Tag";

export function Bio() {
  return (
    <p className="font-mono text-sm leading-[1.85] text-muted-foreground sm:text-base sm:leading-[1.9]">
      I'm a curious person who enjoys bringing little ideas to life. I enjoy
      created playground: <Tag>Dotsy</Tag> <Tag>Souna</Tag> and I also find joy
      in making cool experiences like: <Tag>Chromadance</Tag>
    </p>
  );
}
