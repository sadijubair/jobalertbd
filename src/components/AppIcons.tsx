import type { SVGProps } from "react";

export function TakaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="2.67 2.68 18.65 18.65" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth=".65">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 11h6M9 7c.7 0 2 .6 2 3v4.5c0 3 4 3 4 0"
        />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </g>
    </svg>
  );
}

export function LanguageSwitchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="1.6 1.6 20.8 20.8" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".75"
        d="M16.92 22a5.08 5.08 0 1 1 0-10.16 5.08 5.08 0 0 1 0 10.16ZM5.02 2h3.92c2.07 0 3.07 1 3.02 3.02v3.92c.05 2.07-.95 3.07-3.02 3.02H5.02C3 12 2 11 2 8.93V5.01C2 3 3 2 5.02 2ZM2 15a7 7 0 0 0 7 7l-1.05-1.75M22 9a7 7 0 0 0-7-7l1.05 1.75"
      />
      <text
        x="7"
        y="9.5"
        fill="currentColor"
        fontFamily="serif"
        fontSize="8"
        textAnchor="middle"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".15"
      >
        অ
      </text>
      <text
        x="17"
        y="19.5"
        fill="currentColor"
        fontFamily="sans-serif"
        fontSize="8"
        textAnchor="middle"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".15"
      >
        A
      </text>
    </svg>
  );
}
