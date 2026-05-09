import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#2BB7B8";

export function CoreCapabilities() {
  const { t } = useLanguage();

  const cards = [
    { key: "crisis",      data: t.capabilities.crisis      },
    { key: "consumer",    data: t.capabilities.consumer     },
    { key: "competitive", data: t.capabilities.competitive  },
    { key: "influencer",  data: t.capabilities.influencer   },
  ] as const;

  return (
    <section
      id="capabilities"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "#14141A" }}
    >
      {/* Purple glow blobs mimicking reference */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%", top: "30%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(120,60,200,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%", top: "30%",
          transform: "translate(-50%, -50%)",
          width: 400, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(43,183,184,0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <div className="container relative">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-molten" />
            <p className="label text-white/60">{t.capabilities.eyebrow}</p>
          </div>
          <h2 className="font-display text-display-md font-bold tracking-tight leading-[1.05] max-w-2xl text-white">
            {t.capabilities.title}
          </h2>
        </div>

        {/* Top row: 3 equal cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {cards.slice(0, 3).map((card, i) => (
            <motion.a
              key={card.key}
              href={`#service-${card.key}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white rounded-2xl p-8 flex flex-col cursor-pointer transition-all duration-300"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(200,80,255,0.25), 0 0 0 5px rgba(170,60,230,0.12), 0 0 0 12px rgba(130,40,200,0.07), 0 0 35px 6px rgba(100,20,180,0.18)",
              }}
            >
              <h3 className="font-display text-2xl font-bold mb-4 leading-tight text-ink">
                {card.data.tag}
              </h3>
              <p className="text-ink-600 leading-relaxed flex-1 text-sm">
                {card.data.body}
              </p>
              <span
                className="mt-8 text-sm font-semibold group-hover:underline transition-all"
                style={{ color: ACCENT }}
              >
                Learn more
              </span>
            </motion.a>
          ))}
        </div>

        {/* Bottom row: 1 full-width card */}
        <motion.a
          href={`#service-${cards[3].key}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="group bg-white rounded-2xl p-8 flex flex-col md:flex-row md:items-start md:gap-16 cursor-pointer transition-all duration-300"
          style={{
            boxShadow:
              "0 0 0 1px rgba(200,80,255,0.25), 0 0 0 5px rgba(170,60,230,0.12), 0 0 0 12px rgba(130,40,200,0.07), 0 0 35px 6px rgba(100,20,180,0.18)",
          }}
        >
          <h3 className="font-display text-2xl font-bold mb-4 md:mb-0 leading-tight text-ink md:w-64 flex-shrink-0">
            {cards[3].data.tag}
          </h3>
          <div className="flex flex-col flex-1">
            <p className="text-ink-600 leading-relaxed text-sm flex-1">
              {cards[3].data.body}
            </p>
            <span
              className="mt-8 text-sm font-semibold group-hover:underline transition-all self-start"
              style={{ color: ACCENT }}
            >
              Learn more
            </span>
          </div>
        </motion.a>
      </div>
    </section>
  );
}
