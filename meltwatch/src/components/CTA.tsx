import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function CTA() {
  const { t } = useLanguage();

  return (
    <section
      id="cta"
      className="py-24 lg:py-32 bg-ink text-cream relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-molten/10 blur-3xl pointer-events-none" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h2 className="font-display text-display-lg font-medium tracking-tight leading-[1.02] mb-8">
            {t.cta.title}
          </h2>
          <p className="text-lg text-cream/70 max-w-2xl mb-10 leading-relaxed">
            {t.cta.body}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Button variant="molten" size="lg" className="group">
              {t.cta.button}
              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:rotate-45"
              />
            </Button>
            <p className="font-mono text-xs text-cream/50">{t.cta.note}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
