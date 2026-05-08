import { motion } from "framer-motion";

const COMPETITORS = [
  { name: "Your brand", share: 38.2, delta: "+2.4", you: true },
  { name: "Halcyon Co.", share: 28.7, delta: "−1.1", you: false },
  { name: "Northwind", share: 18.4, delta: "+0.6", you: false },
  { name: "Meridian", share: 9.5, delta: "−0.8", you: false },
  { name: "Other", share: 5.2, delta: "−1.1", you: false },
];

export function CompetitiveVisual() {
  const max = Math.max(...COMPETITORS.map((c) => c.share));

  return (
    <div className="relative bg-ink text-cream rounded-2xl p-6 lg:p-8 overflow-hidden grain">
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
          Share of voice · last 30 days
        </span>
        <div className="flex items-center gap-2 text-[10px] font-mono text-cream/50">
          <span className="h-1.5 w-1.5 rounded-full bg-molten" />
          your brand
        </div>
      </div>

      <div className="space-y-4">
        {COMPETITORS.map((c, i) => (
          <div key={c.name} className="flex items-center gap-4">
            <div className="w-28 shrink-0">
              <div
                className={`text-sm ${
                  c.you ? "text-cream font-medium" : "text-cream/70"
                } truncate`}
              >
                {c.name}
              </div>
            </div>
            <div className="flex-1 relative h-7 bg-cream/[0.06] rounded">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(c.share / max) * 100}%` }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: i * 0.12 }}
                className={`absolute inset-y-0 left-0 rounded ${
                  c.you ? "bg-molten" : "bg-cream/25"
                } flex items-center justify-end pr-3`}
              >
                <span className="font-mono text-xs">{c.share}%</span>
              </motion.div>
            </div>
            <div
              className={`w-12 shrink-0 text-right font-mono text-xs ${
                c.delta.startsWith("+") ? "text-molten" : "text-cream/50"
              }`}
            >
              {c.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-cream/10">
        <div className="font-mono text-[10px] uppercase tracking-widest text-cream/50 mb-4">
          Sentiment-adjusted engagement
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Positive", value: "62%", color: "bg-moss-400" },
            { label: "Neutral", value: "29%", color: "bg-cream/30" },
            { label: "Negative", value: "9%", color: "bg-molten" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-cream/[0.04] rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-cream/50">
                  {s.label}
                </span>
              </div>
              <div className="font-display text-2xl font-medium">{s.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
