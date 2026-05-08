import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { batchAnalyzeEmotion, extractKeywords, detectPainPoints, type KeywordResult, type PainPointResult } from "@/lib/api";

const TEAL = "#2BB7B8";

function toPolyline(pts: number[], h = 120): string {
  return pts.map((v, i) => `${(i / (pts.length - 1)) * 280},${h - (v / 100) * h}`).join(" ");
}

// 示例文本数据（用于演示）
const SAMPLE_TEXTS = [
  "用户对新产品线反应热烈，好评如潮",
  "部分用户反映物流速度有待提升",
  "品牌话题登上热搜，曝光量激增",
  "竞品推出新功能，引发大量讨论",
  "客服态度很好，解决问题很及时",
  "质量不错，面料穿着很舒服",
];

// 预设的演示数据（页面初始化时显示）
const DEMO_ARTICLES = [
  { source: "微博", time: "12:00 AM", text: "用户对新产品线反应热烈，好评如潮", sentiment: "positive", emotion: { key: "正面", label: "满意", icon: "😊", category: "positive", score: 0.92 } },
  { source: "小红书", time: "2h ago", text: "部分用户反映物流速度有待提升", sentiment: "negative", emotion: { key: "负面", label: "不满", icon: "😞", category: "negative", score: 0.78 } },
  { source: "X", time: "4h ago", text: "品牌话题登上热搜，曝光量激增", sentiment: "neutral", emotion: { key: "中性", label: "一般", icon: "😐", category: "neutral", score: 0.65 } },
  { source: "抖音", time: "6h ago", text: "竞品推出新功能，引发大量讨论", sentiment: "neutral", emotion: { key: "中性", label: "一般", icon: "😐", category: "neutral", score: 0.58 } },
  { source: "微信", time: "8h ago", text: "客服态度很好，解决问题很及时", sentiment: "positive", emotion: { key: "正面", label: "满意", icon: "😊", category: "positive", score: 0.89 } },
  { source: "知乎", time: "10h ago", text: "质量不错，面料穿着很舒服", sentiment: "positive", emotion: { key: "正面", label: "满意", icon: "😊", category: "positive", score: 0.94 } },
];

const DEMO_TREND = {
  pos: [75, 72, 78, 80, 76, 82, 85, 79, 83, 88, 84, 87, 82, 85, 89, 86],
  neu: [55, 54, 52, 50, 53, 51, 49, 52, 50, 48, 49, 47, 50, 48, 46, 48],
  neg: [20, 22, 18, 15, 18, 16, 14, 18, 15, 12, 14, 12, 15, 14, 11, 13],
};

const DEMO_KEYWORDS: KeywordResult["data"]["keywords"] = [
  { word: "质量", weight: 0.85, positive_count: 12, negative_count: 2, neutral_count: 1, total: 15, positive_rate: 80 },
  { word: "物流", weight: 0.72, positive_count: 3, negative_count: 8, neutral_count: 2, total: 13, positive_rate: 23 },
  { word: "服务", weight: 0.68, positive_count: 10, negative_count: 1, neutral_count: 2, total: 13, positive_rate: 77 },
  { word: "性价比", weight: 0.65, positive_count: 7, negative_count: 3, neutral_count: 2, total: 12, positive_rate: 58 },
  { word: "外观", weight: 0.58, positive_count: 9, negative_count: 0, neutral_count: 1, total: 10, positive_rate: 90 },
  { word: "包装", weight: 0.52, positive_count: 8, negative_count: 1, neutral_count: 1, total: 10, positive_rate: 80 },
  { word: "价格", weight: 0.48, positive_count: 4, negative_count: 4, neutral_count: 2, total: 10, positive_rate: 40 },
  { word: "发货", weight: 0.45, positive_count: 2, negative_count: 6, neutral_count: 1, total: 9, positive_rate: 22 },
];

const DEMO_PAIN_POINTS: PainPointResult["data"]["pain_points"] = [
  { category: "物流问题", count: 6, severity: 25, examples: ["物流速度慢", "发货延迟", "包装破损"] },
  { category: "售后问题", count: 3, severity: 15, examples: ["退货难", "退款慢", "处理时间长"] },
  { category: "价格问题", count: 2, severity: 10, examples: ["价格偏贵", "性价比一般"] },
];

export function DemoMonitor() {
  const { language } = useLanguage();
  const zh = language === "zh";

  // 状态管理 - 初始化为演示数据
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false); // 是否使用真实API数据
  const [articles, setArticles] = useState(DEMO_ARTICLES);
  const [sentimentStats, setSentimentStats] = useState({ positive: 67, neutral: 17, negative: 16 });
  const [trendData, setTrendData] = useState(DEMO_TREND);
  const [keywords, setKeywords] = useState(DEMO_KEYWORDS);
  const [painPoints, setPainPoints] = useState(DEMO_PAIN_POINTS);
  const [aiInsight, setAiInsight] = useState({
    positive: "多篇文章讨论了新品发布带来的口碑提升，高频词包括「推荐」、「好用」、「值得买」。",
    negative: "物流速度和售后响应时间是主要投诉来源，建议优先处理配送体验问题。"
  });

  // 执行情绪分析
  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 批量分析
      const results = await batchAnalyzeEmotion(SAMPLE_TEXTS);

      // 更新文章列表
      const sources = ["微博", "小红书", "X", "抖音", "微信", "知乎"];
      const updatedArticles = results.map((result, i) => ({
        source: sources[i % sources.length],
        time: `${i * 2}h ago`,
        text: SAMPLE_TEXTS[i],
        sentiment: result.emotion.category === "positive" ? "positive" : result.emotion.category === "negative" ? "negative" : "neutral",
        emotion: result.emotion,
      }));
      setArticles(updatedArticles);
      setIsLive(true);

      // 统计情感分布
      const posCount = results.filter(r => r.emotion.category === "positive").length;
      const negCount = results.filter(r => r.emotion.category === "negative").length;
      const neuCount = results.filter(r => r.emotion.category === "neutral").length;
      const total = results.length;
      setSentimentStats({
        positive: Math.round((posCount / total) * 100),
        neutral: Math.round((neuCount / total) * 100),
        negative: Math.round((negCount / total) * 100),
      });

      // 生成趋势数据
      const basePos = (posCount / total) * 100;
      const baseNeg = (negCount / total) * 100;
      const baseNeu = (neuCount / total) * 100;
      setTrendData({
        pos: Array.from({ length: 16 }, () => Math.max(20, Math.min(95, basePos + (Math.random() - 0.5) * 20))),
        neu: Array.from({ length: 16 }, () => Math.max(10, Math.min(40, baseNeu + (Math.random() - 0.5) * 10))),
        neg: Array.from({ length: 16 }, () => Math.max(5, Math.min(40, baseNeg + (Math.random() - 0.5) * 15))),
      });

      // 提取关键词
      try {
        const kwResult = await extractKeywords(SAMPLE_TEXTS, 10);
        setKeywords(kwResult.keywords);
      } catch {
        // 关键词提取失败不影响主流程
      }

      // 检测痛点
      try {
        const ppResult = await detectPainPoints(SAMPLE_TEXTS);
        setPainPoints(ppResult.pain_points);
      } catch {
        // 痛点检测失败不影响主流程
      }

      // 生成 AI 洞察
      const positiveTexts = results.filter(r => r.emotion.category === "positive").map(r => r.content);
      const negativeTexts = results.filter(r => r.emotion.category === "negative").map(r => r.content);

      setAiInsight({
        positive: positiveTexts.length > 0
          ? (zh ? "正面报道：" : "Positive mentions: ") +
            (zh ? "用户对产品体验和品牌内容反响积极。" : "Users respond positively to product experience and brand content.")
          : (zh ? "暂无明显正面报道" : "No significant positive mentions"),
        negative: negativeTexts.length > 0
          ? (zh ? "负面报道：" : "Negative mentions: ") +
            (zh ? "物流速度和售后响应是主要投诉来源。" : "Logistics speed and after-sales response are main complaint sources.")
          : (zh ? "暂无明显负面报道" : "No significant negative mentions"),
      });

    } catch (err) {
      console.error("Analysis error:", err);
      // API失败时显示错误，但不替换已有的演示数据
      setError(err instanceof Error ? err.message : (zh ? "分析失败" : "Analysis failed"));
    } finally {
      setLoading(false);
    }
  }, [zh]);

  // 组件加载时尝试运行分析
  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  // 重新分析
  const handleRefresh = () => {
    setIsLive(false); // 重置为非实时状态
    runAnalysis();
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {zh ? "实时舆情监控" : "Real-time Sentiment Monitor"}
          </h2>
          <span className={`px-2 py-0.5 text-xs rounded-full ${isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {isLive ? (zh ? "● 实时数据" : "● Live Data") : (zh ? "○ 演示数据" : "○ Demo Data")}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
          style={{ backgroundColor: TEAL }}
        >
          {loading ? (zh ? "分析中..." : "Analyzing...") : (zh ? "🔄 重新分析" : "🔄 Refresh Analysis")}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          <strong>{zh ? "提示：" : "Note: "}</strong>{error}
          <p className="text-xs mt-1 opacity-75">
            {zh ? "当前显示演示数据。请确保 ReviewPulse 后端正在运行（http://localhost:5001）以获取实时数据。" : "Showing demo data. Make sure ReviewPulse backend is running at http://localhost:5001 for live data."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Article list */}
        <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">{zh ? "最新评价" : "Recent Reviews"}</h2>
            <span className="text-xs text-gray-400">{articles.length} {zh ? "条结果" : "results"}</span>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {articles.map((a, i) => (
              <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${TEAL}20`, color: TEAL }}>{a.source}</span>
                  <span className="text-[10px] text-gray-400">{a.time}</span>
                  <span className={`ml-auto text-[10px] font-medium ${a.sentiment === "positive" ? "text-green-600" : a.sentiment === "negative" ? "text-red-500" : "text-gray-400"}`}>
                    {a.emotion.icon} {a.emotion.label}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-4">
          {/* AI insight */}
          <div className="bg-white rounded-2xl border-2 shadow-sm p-5" style={{ borderColor: `${TEAL}50` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: TEAL }}>✦ {zh ? "AI 驱动的洞察" : "AI-Powered Insight"}</p>
            {loading ? (
              <p className="text-sm text-gray-500">{zh ? "正在分析..." : "Analyzing..."}</p>
            ) : (
              <>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  <strong>{zh ? "正面报道：" : "Positive mentions: "}</strong>
                  {aiInsight.positive}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>{zh ? "负面报道：" : "Negative mentions: "}</strong>
                  {aiInsight.negative}
                </p>
              </>
            )}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">{zh ? "情绪分布" : "Sentiment Distribution"}</h3>
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#16A34A" strokeWidth="18" strokeDasharray={`${sentimentStats.positive * 2.51} 251`} strokeDashoffset="25" transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#9CA3AF" strokeWidth="18" strokeDasharray={`${sentimentStats.neutral * 2.51} 251`} strokeDashoffset={`${25 - sentimentStats.positive * 2.51}`} transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#DC2626" strokeWidth="18" strokeDasharray={`${sentimentStats.negative * 2.51} 251`} strokeDashoffset={`${25 - (sentimentStats.positive + sentimentStats.neutral) * 2.51}`} transform="rotate(-90 50 50)" />
                  <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">{sentimentStats.positive}%</text>
                </svg>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#16A34A" }} /><span className="text-gray-600">{zh?"正面":"Positive"}</span><span className="font-semibold text-gray-800 ml-auto">{sentimentStats.positive}%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#9CA3AF" }} /><span className="text-gray-600">{zh?"中性":"Neutral"}</span><span className="font-semibold text-gray-800 ml-auto">{sentimentStats.neutral}%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#DC2626" }} /><span className="text-gray-600">{zh?"负面":"Negative"}</span><span className="font-semibold text-gray-800 ml-auto">{sentimentStats.negative}%</span></div>
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">{zh ? "情绪趋势" : "Sentiment Trend"}</h3>
              <p className="text-xs text-gray-400 mb-3">{zh ? "过去 7 天" : "Last 7 days"}</p>
              {trendData.pos.length > 0 ? (
                <svg viewBox="0 0 280 120" className="w-full">
                  <polyline points={toPolyline(trendData.pos)} fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={toPolyline(trendData.neu)} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={toPolyline(trendData.neg)} fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div className="h-[120px] flex items-center justify-center text-gray-400 text-sm">
                  {loading ? (zh ? "加载中..." : "Loading...") : (zh ? "暂无数据" : "No data")}
                </div>
              )}
              <div className="flex gap-4 mt-2 text-[10px]">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:"#16A34A"}} />{zh?"正面":"Positive"}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:"#9CA3AF"}} />{zh?"中性":"Neutral"}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:"#DC2626"}} />{zh?"负面":"Negative"}</div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{zh ? "热门关键词" : "Top Keywords"}</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.slice(0, 8).map((kw) => {
                  const color = kw.positive_rate > 60 ? "#16A34A" : kw.positive_rate < 40 ? "#DC2626" : "#9CA3AF";
                  return (
                    <span
                      key={kw.word}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {kw.word} ({kw.total})
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pain Points */}
          {painPoints.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{zh ? "痛点检测" : "Pain Point Detection"}</h3>
              <div className="space-y-3">
                {painPoints.map((pp, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-24">{pp.category}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pp.severity}%`, backgroundColor: pp.severity > 30 ? "#DC2626" : pp.severity > 15 ? "#F59E0B" : "#16A34A" }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{pp.count} {zh?"条":"items"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
