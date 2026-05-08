import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function Differentiator() {
  const { t } = useLanguage();

  return (
    <section
      id="differentiator"
      className="py-24 lg:py-32 bg-cream-100 border-y border-ink/[0.08]"
    >
      <div className="container">
        <div className="max-w-4xl mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-molten" />
            <p className="label">{t.differentiator.eyebrow}</p>
          </div>
          <h2 className="font-display text-display-lg font-medium tracking-tight leading-[1.05] mb-8">
            {t.differentiator.title.split("your company").map((part, i, arr) =>
              i < arr.length - 1 ? (
                <>
                  {part}
                  <span key={i} className="font-bold" style={{ color: "#2BB7B8" }}>
                    your company
                  </span>
                </>
              ) : part
            )}
          </h2>
          <p className="text-xl text-ink-600 leading-relaxed">
            {t.differentiator.body}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.differentiator.pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 flex flex-col shadow-sm border border-ink/[0.06] hover:shadow-md transition-shadow duration-300"
            >
              <span className="block font-mono text-xs text-molten mb-6">
                0{i + 1}
              </span>
              <h3 className="font-display text-2xl font-bold mb-4 leading-tight">
                {p.title}
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed flex-1">
                {p.desc}
              </p>
              <a
                href="#"
                className="mt-8 text-sm font-semibold text-molten hover:text-molten-700 transition-colors"
              >
                Learn more
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
