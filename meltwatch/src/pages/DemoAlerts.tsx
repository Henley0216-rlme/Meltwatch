import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

export function DemoAlerts() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const alerts = [
    { level: "high",   source: "微博",    time: "12:00 AM", en: "Brand mention spike detected — 3× above daily average",      zh: "品牌提及量激增，是日均水平的 3 倍" },
    { level: "medium", source: "小红书",  time: "2h ago",   en: "Negative sentiment rising in logistics discussions",           zh: "物流相关讨论中负面情感上升" },
    { level: "low",    source: "X",      time: "4h ago",   en: "Competitor Halcyon Co. launched a new product announcement",   zh: "竞品 Halcyon Co. 发布新品公告" },
    { level: "high",   source: "抖音",    time: "6h ago",   en: "Viral video mentions your brand — 2M+ views in 6 hours",      zh: "病毒视频提及您的品牌，6小时内超200万播放" },
    { level: "low",    source: "微信",    time: "8h ago",   en: "Influencer @张大博主 tagged your brand in a new post",        zh: "网红 @张大博主 在新帖中 @ 了您的品牌" },
  ];

  const levelColor: Record<string, { bg: string; text: string; label: string; labelZh: string }> = {
    high:   { bg: "#FEF2F2", text: "#DC2626", label: "High",   labelZh: "高" },
    medium: { bg: "#FFFBEB", text: "#D97706", label: "Medium", labelZh: "中" },
    low:    { bg: "#F0FDF4", text: "#16A34A", label: "Low",    labelZh: "低" },
  };

  const rules = [
    { en: "Mention spike > 2× daily average",     zh: "提及量超日均 2 倍", active: true },
    { en: "Negative sentiment > 30% in any hour", zh: "任意小时负面情感超 30%", active: true },
    { en: "Competitor product launches",          zh: "竞品新品发布", active: true },
    { en: "Influencer mentions > 100K followers", zh: "百万以上网红提及", active: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{zh ? "智能提醒" : "Smart Alerts"}</h2>
          <p className="text-xs text-gray-400">{zh ? "实时监测异常事件并推送提醒" : "Real-time anomaly detection and notifications"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{zh ? "过去 24 小时：" : "Last 24h:"}</span>
          <span className="text-sm font-semibold text-gray-800">5 {zh ? "条提醒" : "alerts"}</span>
        </div>
      </div>

      {/* Alert feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{zh ? "最新提醒" : "Recent Alerts"}</h3>
          <button className="text-xs font-medium hover:opacity-75 transition-opacity" style={{ color: TEAL }}>
            {zh ? "全部标记已读" : "Mark all read"}
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {alerts.map((a, i) => {
            const lv = levelColor[a.level];
            return (
              <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <span className="mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ backgroundColor: lv.bg, color: lv.text }}>
                  {zh ? lv.labelZh : lv.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug">{zh ? a.zh : a.en}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${TEAL}18`, color: TEAL }}>{a.source}</span>
                    <span className="text-[10px] text-gray-400">{a.time}</span>
                  </div>
                </div>
                <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">{zh ? "忽略" : "Dismiss"}</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert rules */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{zh ? "提醒规则" : "Alert Rules"}</h3>
          <button className="text-xs font-medium hover:opacity-75 transition-opacity" style={{ color: TEAL }}>
            {zh ? "+ 新增规则" : "+ Add rule"}
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {rules.map((r, i) => (
            <div key={i} className="flex items-center px-6 py-3.5">
              <p className="flex-1 text-sm text-gray-700">{zh ? r.zh : r.en}</p>
              <div className="ml-4 flex items-center gap-2">
                <div className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${r.active ? "" : "bg-gray-200"}`} style={r.active ? { backgroundColor: TEAL } : {}}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${r.active ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
