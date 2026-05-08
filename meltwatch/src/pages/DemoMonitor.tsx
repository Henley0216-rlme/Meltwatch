import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

function toPolyline(pts: number[], h = 120): string {
  return pts.map((v, i) => `${(i / (pts.length - 1)) * 280},${h - (v / 100) * h}`).join(" ");
}

export function DemoMonitor() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const articles = [
    { source: "微博",    time: "12:00 AM", en: "Users react positively to new product line launch",       zh: "用户对新产品线反应热烈，好评如潮",   sentiment: "positive" },
    { source: "小红书",  time: "2h ago",   en: "Some users report logistics speed needs improvement",     zh: "部分用户反映物流速度有待提升",         sentiment: "negative" },
    { source: "X",      time: "4h ago",   en: "Brand topic trends on X, exposure surges",                zh: "品牌话题登上热搜，曝光量激增",         sentiment: "neutral" },
    { source: "抖音",    time: "6h ago",   en: "Competitor launches new feature, sparks wide discussion", zh: "竞品推出新功能，引发大量讨论",         sentiment: "neutral" },
  ];

  const trendPos  = [80,75,72,70,68,65,60,55,50,45,30,25,60,70,75,78];
  const trendNeu  = [60,62,60,58,56,55,54,53,52,50,48,50,52,55,55,54];
  const trendNeg  = [20,22,24,22,20,22,25,28,30,35,45,50,30,22,20,18];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      <div className="grid grid-cols-3 gap-5">
        {/* Article list */}
        <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">{zh ? "最新提及" : "Recent Mentions"}</h2>
            <span className="text-xs text-gray-400">1.15k {zh ? "结果" : "Results"}</span>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {articles.map((a, i) => (
              <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${TEAL}20`, color: TEAL }}>{a.source}</span>
                  <span className="text-[10px] text-gray-400">{a.time}</span>
                  <span className={`ml-auto text-[10px] font-medium ${a.sentiment === "positive" ? "text-green-600" : a.sentiment === "negative" ? "text-red-500" : "text-gray-400"}`}>
                    {a.sentiment === "positive" ? (zh ? "正面" : "Positive") : a.sentiment === "negative" ? (zh ? "负面" : "Negative") : (zh ? "中性" : "Neutral")}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-snug">{zh ? a.zh : a.en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-4">
          {/* AI insight */}
          <div className="bg-white rounded-2xl border-2 shadow-sm p-5" style={{ borderColor: `${TEAL}50` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: TEAL }}>✦ {zh ? "AI 驱动的洞察" : "AI-Powered Insight"}</p>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              <strong>{zh ? "正面报道：" : "Positive mentions: "}</strong>
              {zh ? "多篇文章讨论了新品发布带来的口碑提升，高频词包括「推荐」、「好用」、「值得买」。" : "Several posts discuss rising brand affinity following the new product launch. Top phrases: \"highly recommend\", \"easy to use\", \"worth buying\"."}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>{zh ? "负面报道：" : "Negative mentions: "}</strong>
              {zh ? "物流速度和售后响应时间是主要投诉来源，建议优先处理配送体验问题。" : "Logistics speed and after-sales response time are the main complaint sources. Recommend prioritizing delivery experience improvements."}
            </p>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">{zh ? "情绪分布" : "Sentiment"}</h3>
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#16A34A" strokeWidth="18" strokeDasharray="168 83" strokeDashoffset="25" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#DC2626" strokeWidth="18" strokeDasharray="30 221" strokeDashoffset="-143" transform="rotate(-90 50 50)" />
                  <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">68%</text>
                </svg>
                <div className="space-y-2 text-xs">
                  {[{ c:"#16A34A", l:zh?"正面":"Positive", v:"68%" },{ c:"#6B7280", l:zh?"中性":"Neutral", v:"20%" },{ c:"#DC2626", l:zh?"负面":"Negative", v:"12%" }].map((s) => (
                    <div key={s.l} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.c }} /><span className="text-gray-600">{s.l}</span><span className="font-semibold text-gray-800 ml-auto">{s.v}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "情绪趋势" : "Sentiment Trend"}</h3>
              <p className="text-xs text-gray-400 mb-3">{zh ? "过去 7 天" : "Last 7 days"}</p>
              <svg viewBox="0 0 280 120" className="w-full">
                <polyline points={toPolyline(trendPos)} fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={toPolyline(trendNeu)} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={toPolyline(trendNeg)} fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex gap-4 mt-2 text-[10px]">
                {[{c:"#16A34A",l:zh?"正面":"Positive"},{c:"#9CA3AF",l:zh?"中性":"Neutral"},{c:"#DC2626",l:zh?"负面":"Negative"}].map((s)=>(
                  <div key={s.l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:s.c}} />{s.l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
