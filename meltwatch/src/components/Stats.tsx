import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function Stats() {
  const { t } = useLanguage();

  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          <span className="h-px w-10 bg-molten" />
          <p className="label">{t.stats.title}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {t.stats.items.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="border-t border-ink/15 pt-6 relative group"
            >
              <span className="absolute top-0 left-0 h-px w-0 bg-molten transition-all duration-700 group-hover:w-full" />
              <div className="font-display text-5xl lg:text-6xl font-medium tracking-tighter text-ink mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-ink-500 leading-snug">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
