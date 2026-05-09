import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CrisisVisual } from "./visuals/CrisisVisual";
import { CompetitiveVisual } from "./visuals/CompetitiveVisual";
import { ConsumerVisual } from "./visuals/ConsumerVisual";
import { InfluencerVisual } from "./visuals/InfluencerVisual";

const ACCENT = "#2BB7B8";

// Split headline at first punctuation break so second part gets accent color
function splitHeadline(h: string): [string, string] {
  // Chinese full-stop "。"
  const cnDotIdx = h.indexOf("。");
  if (cnDotIdx !== -1 && cnDotIdx < h.length - 1)
    return [h.slice(0, cnDotIdx + 1), h.slice(cnDotIdx + 1)];
  // English ". "
  const dotIdx = h.indexOf(". ");
  if (dotIdx !== -1) return [h.slice(0, dotIdx + 1), h.slice(dotIdx + 2)];
  // English ", "
  const commaIdx = h.indexOf(", ");
  if (commaIdx !== -1) return [h.slice(0, commaIdx + 1), h.slice(commaIdx + 2)];
  const mid = h.indexOf(" ", Math.floor(h.length / 2));
  return mid !== -1 ? [h.slice(0, mid), h.slice(mid + 1)] : [h, ""];
}

export function ServiceSections() {
  const { t } = useLanguage();

  const services = [
    { key: "crisis",      data: t.services.crisis,      visual: <CrisisVisual />,      reverse: false, demoHref: "#" },
    { key: "consumer",    data: t.services.consumer,    visual: <ConsumerVisual />,    reverse: true,  demoHref: "#" },
    { key: "competitive", data: t.services.competitive, visual: <CompetitiveVisual />, reverse: false, demoHref: "#" },
    { key: "influencer",  data: t.services.influencer,  visual: <InfluencerVisual />,  reverse: true,  demoHref: "#" },
  ];

  return (
    <section id="services" className="py-24 lg:py-32">
      <div className="container space-y-32 lg:space-y-40">
        {services.map((s) => (
          <ServiceBlock
            key={s.key}
            id={`service-${s.key}`}
            headline={s.data.headline}
            body={s.data.body}
            bullets={s.data.bullets as readonly string[]}
            visual={s.visual}
            reverse={s.reverse}
            demoHref={s.demoHref}
          />
        ))}
      </div>
    </section>
  );
}

function ServiceBlock({
  id,
  headline,
  body,
  bullets,
  visual,
  reverse,
  demoHref = "#",
}: {
  id: string;
  headline: string;
  body: string;
  bullets: readonly string[];
  visual: ReactNode;
  reverse: boolean;
  demoHref?: string;
}) {
  const [firstPart, secondPart] = splitHeadline(headline);

  return (
    <article
      id={id}
      className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center scroll-mt-24"
    >
      {/* Text column */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={cn(reverse ? "lg:order-2" : "lg:order-1")}
      >
        <h3 className="font-display text-display-md font-bold tracking-tight leading-[1.08] mb-6">
          <span className="text-ink">{firstPart}</span>
          {secondPart && (
            <>
              <br />
              <span style={{ color: ACCENT }}>{secondPart}</span>
            </>
          )}
        </h3>

        <p className="text-lg text-ink-600 leading-relaxed mb-8">{body}</p>

        <ul className="space-y-4 mb-10">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 items-start">
              <span
                className="mt-2 flex-shrink-0 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              <span className="text-ink-700 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        {demoHref.startsWith("/") ? (
          <Link
            to={demoHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Get a product demo
          </Link>
        ) : (
          <a
            href={demoHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Get a product demo
          </a>
        )}
      </motion.div>

      {/* Visual column */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className={cn(reverse ? "lg:order-1" : "lg:order-2")}
      >
        {visual}
      </motion.div>
    </article>
  );
}
