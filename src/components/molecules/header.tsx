import { Fragment } from "react";
import { Star } from "../atoms/star";
import { Wordmark } from "../atoms/wordmark";
import { HolographicText } from "../atoms/holographic-text";
import type { Site } from "@/lib/types";

export function Header({ site }: { site: Site }) {
  return (
    <header>
      <div className="custom-grid min-h-12 items-center py-2">
        <a
          href="/"
          className="group/holographic col-span-2 text-accent md:col-span-3 lg:col-span-6 italic"
          aria-label={`${site.title} home`}
        >
          <Wordmark title={site.title} />
        </a>
        <nav
          aria-label="Primary navigation"
          className="col-span-4 flex flex-wrap items-center justify-end gap-4 md:col-span-5 md:gap-6 lg:col-span-6"
        >
          {site.links.map((link, i) => (
            <Fragment key={i}>
              {i > 0 && <Star className="size-3.5 shrink-0" />}
              <HolographicText className="typo-nav" href={link.url}>
                {link.title}
              </HolographicText>
            </Fragment>
          ))}
        </nav>
      </div>
      <div className="custom-grid" aria-hidden="true">
        <div className="col-span-full border-t border-accent" />
      </div>
    </header>
  );
}
