"use client";

import { memo, type SVGAttributes } from "react";

// ─── Shared icon prop interface ─────────────────────────────────────────────
export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /** Icon size in pixels (width & height). Default 24. */
  size?: number;
  /** Icon fill colour. Default "currentColor". */
  color?: string;
}

// ─── Custom icons (not in RemixIcon) ────────────────────────────────────────

/** Octopus brand mark — custom */
export const AlignUiIcon = memo(function AlignUiIcon({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M5.6 4V7.2H15.4L5.37143 14.1771C4.51143 14.7743 4 15.7543 4 16.8029C4 18.5686 5.43143 20 7.19714 20H16.8V16.8H7.20571L16.8 10.1229V16.8H20V4H5.6Z" />
    </svg>
  );
});

/** Component outline — custom */
export const ComponentLineIcon = memo(function ComponentLineIcon({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M20.8218 11.5357C20.945 11.6588 21.0087 11.8313 20.999 12.0151C20.9894 12.1989 20.9071 12.3791 20.7702 12.5159L12.5159 20.7702C12.3791 20.9071 12.1989 20.9894 12.0151 20.999C11.8313 21.0087 11.6588 20.945 11.5357 20.8218L3.17817 12.4643C3.05503 12.3412 2.99129 12.1687 3.00096 11.9849C3.01064 11.8011 3.09294 11.6209 3.22976 11.4841L11.4841 3.22976C11.6209 3.09294 11.8011 3.01064 11.9849 3.00096C12.1687 2.99129 12.3412 3.05503 12.4643 3.17817L20.8218 11.5357ZM11.0198 12.0516L7.76965 8.80144L4.67427 11.8968L7.92442 15.147L11.0198 12.0516ZM15.1986 16.2303L11.9484 12.9802L8.85303 16.0756L12.1032 19.3257L15.1986 16.2303ZM15.147 7.92442L11.8968 4.67427L8.80144 7.76965L12.0516 11.0198L15.147 7.92442ZM19.3257 12.1032L16.0756 8.85303L12.9802 11.9484L16.2304 15.1986L19.3257 12.1032Z" />
    </svg>
  );
});

/** Component filled — custom */
export const ComponentFillIcon = memo(function ComponentFillIcon({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
    >
      <path d="M16.1277 17.1584L12.5159 20.7702C12.3791 20.9071 12.1989 20.9894 12.0151 20.999C11.8313 21.0087 11.6588 20.945 11.5357 20.8218L7.82124 17.1074L11.9489 12.9797L16.1277 17.1584ZM11.0203 12.0511L6.89263 16.1788L3.17817 12.4643C3.05503 12.3412 2.99129 12.1687 3.00096 11.9849C3.01064 11.8011 3.09294 11.6209 3.22976 11.4841L6.84155 7.87231L11.0203 12.0511ZM16.1788 6.89263L12.0521 11.0193L7.87335 6.84052L11.4841 3.22976C11.6209 3.09294 11.8011 3.01064 11.9849 3.00096C12.1687 2.99129 12.3412 3.05503 12.4643 3.17817L16.1788 6.89263ZM20.8218 11.5357C20.945 11.6588 21.0087 11.8313 20.999 12.0151C20.9894 12.1989 20.9071 12.3791 20.7702 12.5159L17.1595 16.1267L12.9807 11.9479L17.1074 7.82124L20.8218 11.5357Z" />
    </svg>
  );
});

/** Info tooltip filled — custom */
export const InfoTooltipFillIcon = memo(function InfoTooltipFillIcon({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM14.1424 18.1604L14.3341 17.377C14.2349 17.4237 14.0749 17.477 13.8557 17.5376C13.6358 17.5981 13.438 17.629 13.264 17.629C12.8935 17.629 12.6327 17.5683 12.4813 17.4462C12.3309 17.3241 12.256 17.0946 12.256 16.7582C12.256 16.6249 12.2786 16.4264 12.3259 16.1663C12.3717 15.9047 12.4245 15.6722 12.4831 15.469L13.1985 12.9362C13.2685 12.7038 13.3166 12.448 13.3424 12.1693C13.3688 11.8911 13.3811 11.6964 13.3811 11.5858C13.3811 11.0518 13.1939 10.6184 12.8194 10.2841C12.4449 9.95 11.9116 9.78296 11.2204 9.78296C10.8358 9.78296 10.4292 9.85129 10 9.98786C9.56964 10.1240 9.12072 10.2881 8.64808 10.4797L8.45598 11.2637C8.5962 11.2118 8.76325 11.156 8.95869 11.0983C9.15325 11.0407 9.34415 11.0109 9.52987 11.0109C9.9091 11.0109 10.1645 11.0756 10.2983 11.203C10.4322 11.3307 10.4994 11.5578 10.4994 11.8826C10.4994 12.0621 10.4781 12.2616 10.434 12.4784C10.3905 12.6966 10.3361 12.9273 10.2722 13.1708L9.5538 15.714C9.48993 15.9808 9.44321 16.2198 9.41383 16.4322C9.38472 16.6442 9.37069 16.8523 9.37069 17.0546C9.37069 17.5773 9.56378 18.008 9.94986 18.348C10.3359 18.6868 10.8772 18.8571 11.5732 18.8571C12.0264 18.8571 12.4241 18.798 12.7664 18.6787C13.1084 18.56 13.5676 18.3874 14.1424 18.1604ZM14.0150 7.87238C14.3492 7.56253 14.5155 7.18568 14.5155 6.74441C14.5155 6.30414 14.3494 5.92654 14.0150 5.61276C13.6816 5.29982 13.2798 5.14286 12.8100 5.14286C12.3388 5.14286 11.9354 5.29946 11.5989 5.61276C11.2624 5.92654 11.0937 6.30401 11.0937 6.74441C11.0937 7.18568 11.2624 7.5624 11.5989 7.87238C11.936 8.18336 12.3387 8.33897 12.8100 8.33897C13.2799 8.33897 13.6816 8.18336 14.0150 7.87238Z"
      />
    </svg>
  );
});

// ─── Re‑export everything from remixicon‑react ─────────────────────────────
// Users import individual icons for tree‑shaking:
//   import { ArrowRightLineIcon } from "remixicon-react/ArrowRightLineIcon";
// Or via the barrel:
//   import { ArrowRightLineIcon } from "@/components/ui/icon";
//
// The full catalogue (~2 540 icons) mirrors the Figma "HT icon lib".
// Naming: kebab‑case in Figma → PascalCase + "Icon" suffix in code.
//   e.g. "arrow-right-line" → ArrowRightLineIcon
//
// ─── Icon wrapper component ────────────────────────────────────────────────

/**
 * Generic wrapper that renders any icon element at a given size / colour.
 *
 * Usage:
 *   import ArrowRightLineIcon from "remixicon-react/ArrowRightLineIcon";
 *   <Icon as={ArrowRightLineIcon} size={20} color={tokens.icon.primary} />
 *   <Icon as={AlignUiIcon} size={16} />
 */
export interface IconWrapperProps {
  /** The icon component to render */
  as: React.ComponentType<IconProps>;
  /** Size in px (default 24) */
  size?: number;
  /** Fill colour (default "currentColor") */
  color?: string;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function Icon({ as: Component, size = 24, color = "currentColor", className, style, ...rest }: IconWrapperProps & Omit<IconProps, "as">) {
  return <Component size={size} color={color} className={className} style={style} {...rest} />;
}
