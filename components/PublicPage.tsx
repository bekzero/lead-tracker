"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { publicCopy, type PublicLanguage } from "@/lib/public-copy";

export function PublicPage({ eventName }: { eventName: string }) {
  const [language, setLanguage] = useState<PublicLanguage>("fr");
  const copy = publicCopy[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <main className="public-shell" lang={language}>
      <section className="intro" aria-labelledby="page-title">
        <div className="public-topbar">
          <Image
            className="public-logo"
            src="/brand/kzero-passwordless-horizontal.png"
            width={3361}
            height={1419}
            alt="KZero Passwordless"
            priority
          />
          <div className="language-toggle" aria-label="Langue / Language">
            {(["fr", "en"] as const).map((option) => (
              <button
                className="language-button"
                type="button"
                key={option}
                aria-pressed={language === option}
                onClick={() => setLanguage(option)}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <p className="eyebrow">{eventName}</p>
        <h1 id="page-title">{copy.heroTitle}</h1>
        <p className="intro-copy">{copy.heroCopy}</p>
      </section>
      <LeadForm language={language} />
      <footer className="public-footer">© {new Date().getFullYear()} KZero Passwordless</footer>
    </main>
  );
}
