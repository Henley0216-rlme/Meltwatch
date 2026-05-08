import { motion } from "framer-motion";
import { AlertCircle, Bell } from "lucide-react";

export function CrisisVisual() {
  return (
    <div className="flex flex-col gap-6">
    <div className="relative bg-cream-50 border border-ink/10 rounded-2xl px-6 py-4 lg:px-8 lg:py-5 overflow-hidden grain">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-molten animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-700">
            Live monitor
          </span>
        </div>
        <span className="font-mono text-[10px] text-ink-400">14:32:08 UTC</span>
      </div>

      <div className="relative h-40 mb-6">
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-ink/[0.08] w-full" />
          ))}
        </div>

        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 300 160"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="vol" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut" }}
            d="M 0 130 Q 30 125 50 122 T 100 118 T 150 115 T 200 110 L 220 105 L 230 95 L 240 25 L 250 60 L 260 75 L 280 80 L 300 78"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.path
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut" }}
            d="M 0 130 Q 30 125 50 122 T 100 118 T 150 115 T 200 110 L 220 105 L 230 95 L 240 25 L 250 60 L 260 75 L 280 80 L 300 78 L 300 160 L 0 160 Z"
            fill="url(#vol)"
            stroke="none"
          />
          <motion.circle
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5, type: "spring" }}
            cx="240"
            cy="25"
            r="5"
            fill="#16A34A"
            stroke="#F7F3EC"
            strokeWidth="2"
          />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8 }}
          className="absolute top-0 right-12 bg-ink text-cream px-2.5 py-1 rounded-md font-mono text-[9px] flex items-center gap-1"
        >
          <AlertCircle size={10} />
          Anomaly · +840%
        </motion.div>
      </div>

      <div className="space-y-2.5">
        {[
          {
            tag: "Critical",
            text: "Negative sentiment spike — product line A",
            time: "23s ago",
            tone: "molten" as const,
          },
          {
            tag: "Watch",
            text: "Twitter mentions trending — #recall",
            time: "1m ago",
            tone: "ink" as const,
          },
          {
            tag: "Info",
            text: "Reddit thread climbing — r/consumerfinance",
            time: "4m ago",
            tone: "ink" as const,
          },
        ].map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="flex items-center gap-3 bg-cream border border-ink/10 rounded-lg px-3 py-2.5"
          >
            <Bell
              size={14}
              className={
                alert.tone === "molten" ? "text-molten" : "text-ink-500"
              }
            />
            <span
              className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                alert.tone === "molten"
                  ? "bg-molten text-cream"
                  : "bg-ink/[0.08] text-ink-700"
              }`}
            >
              {alert.tag}
            </span>
            <span className="text-xs text-ink-700 flex-1 truncate">
              {alert.text}
            </span>
            <span className="font-mono text-[10px] text-ink-400 shrink-0">
              {alert.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
    <img
      src="/Engage-Hero.png"
      alt="Engage Hero"
      className="w-full h-auto rounded-2xl"
      draggable={false}
    />
    </div>
  );
}
