import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Bell, BarChart2, Users, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

const DATA_SOURCES = [
  { id: "x",           src: "/icons/x.png",           label: "X" },
  { id: "facebook",    src: "/icons/facebook.png",    label: "Facebook" },
  { id: "xiaohongshu", src: "/icons/xiaohongshu.png", label: "小红书" },
  { id: "douyin",      src: "/icons/douyin.png",      label: "抖音" },
  { id: "weixin",      src: "/icons/weixin.png",      label: "微信" },
  { id: "weibo",       src: "/icons/weibo.png",       label: "微博" },
  { id: "youtube",     src: "/icons/yotube.png",      label: "YouTube" },
  { id: "bilibili",    src: "/icons/bilibili.png",    label: "Bilibili" },
  { id: "taobao",      src: "/icons/taobao.png",      label: "淘宝" },
  { id: "dewu",        src: "/icons/dewu.png",        label: "得物" },
  { id: "claude",      src: "/icons/claude.png",      label: "Claude" },
  { id: "deepseek",    src: "/icons/deepseek.png",    label: "DeepSeek" },
  { id: "doubao",      src: "/icons/doubao.png",      label: "豆包" },
  { id: "gemini",      src: "/icons/gemini.png",      label: "Gemini" },
  { id: "yuanbao",     src: "/icons/yuanbao.png",     label: "元宝" },
  { id: "chatgpt",     src: "/icons/chatgpt.png",     label: "ChatGPT" },
  { id: "google",      src: "/icons/google.png",      label: "Google" },
];

export function DemoHome() {
  const { language } = useLanguage();
  const zh = language === "zh";
  const navigate = useNavigate();

  const [selected, setSelected] = useState<Set<string>>(
    new Set(["x", "facebook", "xiaohongshu", "douyin", "weixin", "weibo"])
  );
  function toggle(id: string) {
    setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? (zh ? "早上好" : "Good morning") : hour < 18 ? (zh ? "下午好" : "Good afternoon") : (zh ? "晚上好" : "Good evening");

  const recents = [
    { icon: TrendingUp, label: zh ? "品牌分析 · 探索"       : "Brand Analysis · Explore",       to: "/demo/explore",    time: zh ? "4 天前" : "4d ago" },
    { icon: Bell,       label: zh ? "电动汽车 · 监测仪表盘" : "Electric Vehicles · Monitor",     to: "/demo/monitor",    time: zh ? "5 天前" : "5d ago" },
    { icon: BarChart2,  label: zh ? "消费者洞察 · 报告"     : "Consumer Insights · Report",      to: "/demo/analytics",  time: zh ? "1 周前" : "1w ago" },
  ];

  const overviews = [
    { icon: TrendingUp, to: "/demo/explore",    en: "Explore insights & trends",    zh: "探索洞察与趋势",   desc: { en: "Create searches to monitor brand, competitor, and industry media coverage.", zh: "创建搜索以监控品牌、竞品和行业媒体报道。" } },
    { icon: Bell,       to: "/demo/monitor",    en: "Monitor media coverage",       zh: "监测媒体报道",     desc: { en: "Personalize monitoring to view and share relevant media coverage.",         zh: "个性化监测体验，轻松查看和分享相关媒体报道。" } },
    { icon: BarChart2,  to: "/demo/analytics",  en: "Report on media coverage",     zh: "媒体报道报告",     desc: { en: "Access and manage all of your reports in one place.",                       zh: "在一个地方访问和管理所有报告。" } },
    { icon: Users,      to: "/demo/influencer", en: "Manage influencer campaigns",  zh: "管理网红营销活动", desc: { en: "Find, vet, and collaborate with the right influencers for your brand.",     zh: "为品牌找到、评估并合作合适的网红创作者。" } },
  ];

  const alerts = [
    { title: { en: "Brand volume spike · Weibo",        zh: "品牌声量突增 · 微博" },         time: "5h ago", level: "critical" },
    { title: { en: "Competitor launch · Xiaohongshu",   zh: "竞品新品发布 · 小红书" },       time: "6h ago", level: "watch"    },
    { title: { en: "Positive sentiment trending up",    zh: "正面评价趋势上升" },             time: "8h ago", level: "info"     },
    { title: { en: "New industry report published",     zh: "行业报告新发布" },               time: "1d ago", level: "info"     },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
      {/* Greeting */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{greeting}! 👋</h2>
        <p className="text-gray-500 text-sm">{zh ? "今天想了解什么？" : "What would you like to explore today?"}</p>
      </div>

      {/* Data source selector */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">{zh ? "选择数据来源" : "Data Sources"}</h2>
          <span className="text-xs text-gray-400">{selected.size} {zh ? "已选" : "selected"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((src) => {
            const on = selected.has(src.id);
            return (
              <button
                key={src.id}
                onClick={() => toggle(src.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                style={on ? { borderColor: TEAL, color: TEAL, backgroundColor: `${TEAL}14` } : { borderColor: "#e5e7eb", color: "#6b7280", backgroundColor: "#fff" }}
              >
                <img src={src.src} alt={src.label} className="w-3.5 h-3.5 object-contain" />
                {src.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Recent activity */}
          <h2 className="text-sm font-semibold text-gray-700">{zh ? "继续你上次中断的地方" : "Pick up where you left off"}</h2>
          <div className="space-y-2">
            {recents.map((r) => (
              <button key={r.label} onClick={() => navigate(r.to)} className="w-full bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50">
                  <r.icon size={15} style={{ color: TEAL }} />
                </div>
                <span className="flex-1 text-sm text-gray-700 font-medium">{r.label}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{r.time}</span>
              </button>
            ))}
          </div>

          {/* Product overview */}
          <h2 className="text-sm font-semibold text-gray-700 pt-2">{zh ? "产品概述" : "Product overview"}</h2>
          <div className="grid grid-cols-2 gap-3">
            {overviews.map((o) => (
              <button key={o.en} onClick={() => navigate(o.to)} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left">
                <div className="flex items-center gap-2 mb-2">
                  <o.icon size={15} style={{ color: TEAL }} />
                  <span className="text-sm font-semibold text-gray-800">{zh ? o.zh : o.en}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{zh ? o.desc.zh : o.desc.en}</p>
                <span className="text-xs font-medium" style={{ color: TEAL }}>{zh ? "前往 →" : "Go to →"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">{zh ? "最新提醒" : "Recent Alerts"}</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {alerts.map((a, i) => (
              <div key={i} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-start gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
                <AlertCircle size={13} className={`mt-0.5 flex-shrink-0 ${a.level === "critical" ? "text-red-500" : a.level === "watch" ? "text-yellow-500" : "text-gray-400"}`} />
                <div>
                  <p className="text-xs font-medium text-gray-700 leading-snug">{zh ? a.title.zh : a.title.en}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
