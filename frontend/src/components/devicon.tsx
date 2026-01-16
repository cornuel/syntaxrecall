"use client";

import {
  PythonOriginal,
  JavascriptOriginal,
  TypescriptOriginal,
  ReactOriginal,
  Html5Original,
  Css3Original,
  PostgresqlOriginal,
  BashOriginal,
} from "devicons-react";
import { cn } from "@/lib/utils";

interface DeviconProps {
  icon: string;
  size?: number;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; width?: number; height?: number }>> = {
  python: PythonOriginal,
  javascript: JavascriptOriginal,
  typescript: TypescriptOriginal,
  react: ReactOriginal,
  html5: Html5Original,
  css3: Css3Original,
  postgresql: PostgresqlOriginal,
  bash: BashOriginal,
};

export function Devicon({ icon, size = 24, className }: DeviconProps) {
  const IconComponent = ICON_MAP[icon];

  if (!IconComponent) return null;

  return (
    <IconComponent
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}
