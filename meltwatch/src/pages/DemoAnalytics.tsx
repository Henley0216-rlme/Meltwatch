import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

export function DemoAnalytics() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const keywords = [
    { word: "market", pct: 95 }, { word: "vehicles", pct: 88 }, { word: "report", pct: 80 },
    { word: "technology", pct: 72 }, { word: "consumer", pct: 65 }, { word: "demand", pct: 58 },
    { word: "battery life", pct: 50 }, { word: "electric", pct: 44 },
  ];

  const locations = [
    { name: "China",         pos: 60, neg: 8  },
    { name: "United States", pos: 50, neg: 12 },
    { name: "Japan",         pos: 40, neg: 5  },
    { name: "Germany",       pos: 30, neg: 8  },
    { name: "Australia",     pos: 22, neg: 3  },
  ];

  const trend = [800,900,1100,1000,950,1200,1500,1800,1400,1600,2000,1700,1900,2200,2000,1800];
  const max = Math.max(...trend);
  function toLine(pts: number[]): string {
    return pts.map((v, i) => `${(i / (pts.length - 1)) * 360},${80 - (v / max) * 70}`).join(" ");
  }

  const stats = [
    { en: "Total Mentions", zh: "总提及数",     val: "1,150" },
    { en: "Positive Rate",  zh: "正面情感占比", val: "68%"   },
    { en: "Avg. Reach",     zh: "平均触达量",   val: "122M"  },
    { en: "Active Sources", zh: "活跃数据源",   val: "6"     },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">{zh ? "品牌分析报告" : "Brand Analysis Report"}</h2>
          <p className="text-xs text-gray-400">{zh ? "数据更新：今天" : "Updated: Today"}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {[zh?"过去7天":"Last 7 days", zh?"过去30天":"Last 30 days"].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${i === 0 ? "text-white" : "text-gray-600 bg-gray-100"}`} style={i === 0 ? { backgroundColor: TEAL } : {}}>{t}</button>
          ))}
        </div>
      </div>

      {/* AI summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-3">{zh ? "AI 报告摘要" : "AI Report Summary"}</h3>
        <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
          <p>{zh ? "本期报告涵盖品牌在各大平台的媒体曝光情况，主题涉及新品发布、竞品动态以及消费者情绪变化。" : "This report covers brand media exposure across major platforms, covering new product launches, competitor dynamics, and consumer sentiment shifts."}</p>
          <p>{zh ? "正面声量主要来自产品体验和品牌内容；负面声量集中在物流和定价话题。" : "Positive volume comes primarily from product experience and brand storytelling; negative volume centers on logistics and pricing topics."}</p>
          <p>{zh ? "整体品牌情感指数较上期提升 12%，建议持续加强内容营销和用户互动策略。" : "Overall brand sentiment index improved 12% vs. the previous period. Recommend strengthening content marketing and user engagement strategies."}</p>
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "情绪趋势" : "Sentiment Trend"}</h3>
        <p className="text-xs text-gray-400 mb-4">{zh ? "过去 14 天 · 总提及数" : "Last 14 days · Total mentions"}</p>
        <svg viewBox="0 0 380 90" className="w-full">
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,80 ${toLine(trend)} 360,80`} fill="url(#ag)" />
          <polyline points={toLine(trend)} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex mt-2">
          {Array.from({ length: 8 }, (_, i) => <span key={i} className="flex-1 text-center text-[10px] text-gray-400">{`Oct ${16 + i}`}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Keywords */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "热门关键词及情感" : "Top Keywords with Sentiment"}</h3>
          <p className="text-xs text-gray-400 mb-4">{zh ? "过去 7 天" : "Last 7 days"}</p>
          <div className="space-y-2">
            {keywords.map((k) => (
              <div key={k.word} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 text-right truncate">{k.word}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${k.pct}%`, backgroundColor: "#16A34A", opacity: 0.65 }} />
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">{Math.round(k.pct * 30)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "热门地区情感" : "Top Locations"}</h3>
          <p className="text-xs text-gray-400 mb-4">{zh ? "过去 7 天" : "Last 7 days"}</p>
          <div className="space-y-3">
            {locations.map((l) => (
              <div key={l.name}>
                <span className="text-xs text-gray-600 block mb-1">{l.name}</span>
                <div className="flex h-3 rounded overflow-hidden bg-gray-100">
                  <div style={{ width: `${l.pos}%`, backgroundColor: "#16A34A", opacity: 0.7 }} />
                  <div style={{ width: `${l.neg}%`, backgroundColor: "#DC2626", opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-3 text-[10px]">
            {[{ c:"#16A34A", l:zh?"正面":"Positive" },{ c:"#DC2626", l:zh?"负面":"Negative" }].map((s) => (
              <div key={s.l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.c }} />{s.l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.en} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{zh ? s.zh : s.en}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
