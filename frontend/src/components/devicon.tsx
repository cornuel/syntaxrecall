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
  VuejsOriginal,
  GoOriginal,
  RustOriginal,
  JavaOriginal,
  CplusplusOriginal,
  RubyOriginal,
  PhpOriginal,
} from "devicons-react";
import { cn } from "@/lib/utils";

// ... middle content ...

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  python: PythonOriginal,
  javascript: JavascriptOriginal,
  typescript: TypescriptOriginal,
  react: ReactOriginal,
  html5: Html5Original,
  css3: Css3Original,
  postgresql: PostgresqlOriginal,
  bash: BashOriginal,
  vuejs: VuejsOriginal,
  go: GoOriginal,
  rust: RustOriginal,
  java: JavaOriginal,
  cplusplus: CplusplusOriginal,
  ruby: RubyOriginal,
  php: PhpOriginal,
};

export function Devicon({ icon, size = 24, className }: DeviconProps) {
  const IconComponent = ICON_MAP[icon];

  if (!IconComponent) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <IconComponent size={size} width={size} height={size} />
    </div>
  );
}
