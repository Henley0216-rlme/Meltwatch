import { motion } from "framer-motion";

const INITIATIVES = [
  { name: "Brand Positioning", impact: "HIGH", score: 91, delta: "+12", accent: true },
  { name: "Market Expansion", impact: "HIGH", score: 78, delta: "+6", accent: false },
  { name: "Product Differentiation", impact: "MED", score: 63, delta: "+3", accent: false },
  { name: "Competitive Response", impact: "MED", score: 47, delta: "−2", accent: false },
];

const SIGNALS = [
  { label: "Category momentum", value: "+18%", sub: "month-over-month", positive: true },
  { label: "White spaces identified", value: "3", sub: "new segments", positive: true },
  { label: "Strategic window", value: "6–8 wk", sub: "recommended action", positive: null },
];

export function CompetitiveVisual() {
  const max = Math.max(...INITIATIVES.map((c) => c.score));

  return (
    <div className="relative bg-ink text-cream rounded-2xl p-6 lg:p-8 overflow-hidden grain">
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
          Strategic Brief · Q2 2026
        </span>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-molten">
          <span className="h-1.5 w-1.5 rounded-full bg-molten animate-pulse" />
          Live signals
        </div>
      </div>

      {/* Priority matrix */}
      <div className="mb-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-cream/40">
          Initiative Priority Matrix
        </span>
      </div>
      <div className="space-y-3.5 mb-8">
        {INITIATIVES.map((item, i) => (
          <div key={item.name} className="flex items-center gap-4">
            <div className="w-36 shrink-0 flex flex-col gap-0.5">
              <span className={`text-xs truncate ${item.accent ? "text-cream font-medium" : "text-cream/70"}`}>
                {item.name}
              </span>
              <span className="font-mono text-[9px] text-cream/35 uppercase tracking-wider">
                Impact: {item.impact}
              </span>
            </div>
            <div className="flex-1 relative h-7 bg-cream/[0.06] rounded">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.score / max) * 100}%` }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: i * 0.12 }}
                className={`absolute inset-y-0 left-0 rounded flex items-center justify-end pr-3 ${
                  item.accent ? "bg-molten" : "bg-cream/20"
                }`}
              >
                <span className="font-mono text-xs">{item.score}</span>
              </motion.div>
            </div>
            <div
              className={`w-10 shrink-0 text-right font-mono text-xs ${
                item.delta.startsWith("+") ? "text-molten" : "text-cream/40"
              }`}
            >
              {item.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Market signals */}
      <div className="pt-6 border-t border-cream/10">
        <div className="font-mono text-[9px] uppercase tracking-widest text-cream/40 mb-4">
          Market Opportunity Signals
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SIGNALS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-cream/[0.04] rounded-lg p-3"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    s.positive === true ? "bg-molten" : s.positive === false ? "bg-red-400" : "bg-cream/30"
                  }`}
                />
                <span className="font-mono text-[8px] uppercase tracking-wider text-cream/40 leading-tight">
                  {s.label}
                </span>
              </div>
              <div className="font-display text-xl font-medium leading-none mb-1">{s.value}</div>
              <div className="font-mono text-[8px] text-cream/30">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
