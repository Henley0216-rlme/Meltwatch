import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

export function DemoCompetitive() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const brands = [
    { name: zh ? "我方品牌" : "Your Brand", share: 38.2, delta: "+2.4", you: true },
    { name: "Halcyon Co.",                  share: 28.7, delta: "−1.1", you: false },
    { name: "Northwind",                    share: 18.4, delta: "+0.6", you: false },
    { name: "Meridian",                     share: 9.5,  delta: "−0.8", you: false },
    { name: zh ? "其他" : "Other",           share: 5.2,  delta: "−1.1", you: false },
  ];
  const maxShare = Math.max(...brands.map((b) => b.share));

  const sentiment = [
    { en: "Positive", zh: "正面", pct: 62, color: "#16A34A" },
    { en: "Neutral",  zh: "中性", pct: 29, color: "#9CA3AF" },
    { en: "Negative", zh: "负面", pct: 9,  color: "#DC2626" },
  ];

  const compareRows = [
    { metric: zh ? "总提及数" : "Total Mentions",   you: "1,150", comp: "840"  },
    { metric: zh ? "正面情感率" : "Positive Rate",  you: "68%",   comp: "51%"  },
    { metric: zh ? "平均触达" : "Avg. Reach",       you: "122M",  comp: "88M"  },
    { metric: zh ? "活跃来源" : "Active Sources",   you: "6",     comp: "4"    },
    { metric: zh ? "用户互动率" : "Engagement Rate", you: "4.2%",  comp: "3.1%" },
  ];

  const trend = [
    { name: zh ? "我方品牌" : "Your Brand", pts: [32,34,35,36,35,37,38], color: TEAL },
    { name: "Halcyon Co.",                  pts: [30,31,30,29,30,28,28], color: "#9CA3AF" },
    { name: "Northwind",                    pts: [17,18,18,19,18,18,18], color: "#F59E0B" },
  ];
  const allPts = trend.flatMap((t) => t.pts);
  const tMin = Math.min(...allPts) - 2;
  const tMax = Math.max(...allPts) + 2;
  function toPoints(pts: number[]): string {
    return pts.map((v, i) => `${(i / (pts.length - 1)) * 340},${80 - ((v - tMin) / (tMax - tMin)) * 70}`).join(" ");
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">{zh ? "竞品分析报告" : "Competitive Analysis"}</h2>
          <p className="text-xs text-gray-400">{zh ? "数据更新：今天" : "Updated: Today"}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {[zh ? "过去7天" : "Last 7 days", zh ? "过去30天" : "Last 30 days"].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${i === 0 ? "text-white" : "text-gray-600 bg-gray-100"}`} style={i === 0 ? { backgroundColor: TEAL } : {}}>{t}</button>
          ))}
        </div>
      </div>

      {/* Share of voice */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "声量份额" : "Share of Voice"}</h3>
        <p className="text-xs text-gray-400 mb-4">{zh ? "过去 30 天" : "Last 30 days"}</p>
        <div className="space-y-3">
          {brands.map((b) => (
            <div key={b.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24 text-right truncate">{b.name}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
                <div
                  className="h-full rounded flex items-center justify-end pr-2 transition-all"
                  style={{ width: `${(b.share / maxShare) * 100}%`, backgroundColor: b.you ? TEAL : "#CBD5E1" }}
                >
                  <span className="text-[11px] font-mono text-white">{b.share}%</span>
                </div>
              </div>
              <span className={`text-xs font-mono w-10 text-right ${b.delta.startsWith("+") ? "text-green-600" : "text-gray-400"}`}>{b.delta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "声量趋势对比" : "Share of Voice Trend"}</h3>
          <p className="text-xs text-gray-400 mb-3">{zh ? "过去 7 天" : "Last 7 days"}</p>
          <svg viewBox="0 0 360 90" className="w-full">
            {trend.map((t) => (
              <polyline key={t.name} points={toPoints(t.pts)} fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </svg>
          <div className="flex flex-wrap gap-3 mt-2">
            {trend.map((t) => (
              <div key={t.name} className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "竞品情感分布（我方）" : "Brand Sentiment (Your Brand)"}</h3>
          <p className="text-xs text-gray-400 mb-4">{zh ? "过去 7 天" : "Last 7 days"}</p>
          <div className="flex h-4 rounded overflow-hidden mb-4">
            {sentiment.map((s) => (
              <div key={s.en} style={{ width: `${s.pct}%`, backgroundColor: s.color, opacity: 0.8 }} />
            ))}
          </div>
          <div className="space-y-2">
            {sentiment.map((s) => (
              <div key={s.en} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600">{zh ? s.zh : s.en}</span>
                </div>
                <span className="font-mono text-gray-700">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Head-to-head comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "与第一竞品对比（Halcyon Co.）" : "Head-to-Head vs. Halcyon Co."}</h3>
        <p className="text-xs text-gray-400 mb-4">{zh ? "过去 7 天" : "Last 7 days"}</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left pb-2 font-medium">{zh ? "指标" : "Metric"}</th>
              <th className="text-right pb-2 font-medium" style={{ color: TEAL }}>{zh ? "我方品牌" : "Your Brand"}</th>
              <th className="text-right pb-2 font-medium text-gray-400">Halcyon Co.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {compareRows.map((r) => (
              <tr key={r.metric}>
                <td className="py-2 text-gray-600">{r.metric}</td>
                <td className="py-2 text-right font-mono font-medium" style={{ color: TEAL }}>{r.you}</td>
                <td className="py-2 text-right font-mono text-gray-400">{r.comp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
