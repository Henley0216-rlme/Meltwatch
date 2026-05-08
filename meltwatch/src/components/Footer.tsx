import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function Footer() {
  const { t, language, setLanguage } = useLanguage();

  const columns = [
    { heading: t.footer.products, items: t.footer.productItems },
    { heading: t.footer.company, items: t.footer.companyItems },
    { heading: t.footer.resources, items: t.footer.resourceItems },
    { heading: t.footer.legal, items: t.footer.legalItems },
  ];

  return (
    <footer className="bg-cream border-t border-ink/[0.08]">
      <div className="container py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-4">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-3xl font-medium">
                Meltwatch
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-molten" />
            </div>
            <p className="text-sm text-ink-600 max-w-xs leading-relaxed mb-6">
              {t.footer.tagline}
            </p>

            <div className="inline-flex items-center gap-0.5 rounded-full border border-ink/15 p-0.5 text-xs font-mono">
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-3 py-1 rounded-full transition-all",
                  language === "en"
                    ? "bg-ink text-cream"
                    : "text-ink-500 hover:text-ink"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("zh")}
                className={cn(
                  "px-3 py-1 rounded-full transition-all",
                  language === "zh"
                    ? "bg-ink text-cream"
                    : "text-ink-500 hover:text-ink"
                )}
              >
                中文
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="label mb-4">{col.heading}</h4>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-ink-600 hover:text-molten transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-ink/[0.08] flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <p className="font-mono text-xs text-ink-500">
            {t.footer.copyright}
          </p>
          <div className="flex items-center gap-6 text-xs text-ink-500 font-mono">
            <span>EN · 中文</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-500 animate-pulse" />
              {t.footer.status}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
