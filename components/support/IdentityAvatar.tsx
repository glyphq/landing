import Avatar from "boring-avatars";

const MARBLE_COLORS = ["#ccfcfb", "#7dd3fc", "#6ee7b7", "#fbbf24", "#a78bfa", "#f87171"];
const MONOCHROME_COLORS = ["#d2d2d2", "#a0a0a0", "#737373", "#484848", "#242424", "#080808"];

export function IdentityAvatar({ identity, size, monochrome = false, square = false }: { identity: string; size: number; monochrome?: boolean; square?: boolean }) {
  return (
    <span className={`identity-avatar${monochrome ? " identity-avatar-monochrome" : ""}`} style={{ width: size, height: size }} aria-hidden="true">
      <Avatar size={size} name={identity} variant="marble" colors={monochrome ? MONOCHROME_COLORS : MARBLE_COLORS} square={square} />
    </span>
  );
}
