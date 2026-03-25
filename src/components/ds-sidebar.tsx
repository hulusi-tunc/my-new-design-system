"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Tools",
    items: [
      { label: "Customize", href: "/customize" },
    ],
  },
  {
    label: "Getting started",
    items: [
      { label: "Introduction", href: "/" },
      { label: "Installation", href: "/installation" },
    ],
  },
  {
    label: "Foundations",
    items: [
      { label: "Colors", href: "/colors" },
      { label: "Typography", href: "/typography" },
      { label: "Spacing & Radius", href: "/spacing" },
    ],
  },
  {
    label: "Components",
    items: [
      { label: "Badge", href: "/badges" },
      { label: "Button", href: "/buttons" },
      { label: "Input", href: "/inputs" },
      { label: "Navigation", href: "/navigation" },
      { label: "Tag", href: "/tags" },
    ],
  },
];

export function DSSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-12 left-0 w-52 h-[calc(100vh-3rem)] overflow-y-auto">
      <nav className="py-6 px-4">
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.label}>
              <h4 className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2.5 mb-1">
                {section.label}
              </h4>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block px-2.5 py-[5px] rounded text-[13px] transition-colors ${
                          active
                            ? "text-neutral-900 dark:text-neutral-100 font-medium"
                            : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
