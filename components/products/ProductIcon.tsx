import type { ComponentType } from "react";
import {
  Book2,
  Chart2,
  CodeSquare,
  Command,
  Database,
  LinkRoundAngle,
  Magnifer,
  Programming,
  SettingsMinimalistic,
  Wallet2,
  type IconProps,
} from "@solar-icons/react";

const productIcons: Record<string, ComponentType<IconProps>> = {
  wallet: Wallet2,
  connect: LinkRoundAngle,
  explorer: Magnifer,
  sdk: Programming,
  cli: Command,
  devkit: SettingsMinimalistic,
  api: Database,
  docs: Book2,
  trade: Chart2,
};

export function ProductIcon({ productId, ...props }: { productId: string } & IconProps) {
  const Icon = productIcons[productId] ?? CodeSquare;
  return <Icon {...props} />;
}
