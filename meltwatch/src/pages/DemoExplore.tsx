import { useState, useRef } from "react";
import { TrendingUp, Send, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

const QUICK_ACTIONS = [
  { en: { title: "Analyze brand sentiment",   desc: "Discover how users feel about your brand.",                          query: "Analyze brand sentiment across all data sources this month." },
    zh: { title: "分析品牌情感",               desc: "了解用户对你品牌的整体感受。",                                       query: "分析本月所有数据源中品牌的整体情感倾向。" } },
  { en: { title: "Track competitor mentions", desc: "See how your competitors are being discussed online.",               query: "Compare share of voice with top 3 competitors over the last 30 days." },
    zh: { title: "追踪竞品提及",               desc: "了解竞争对手在网络上被讨论的方式。",                                 query: "对比过去 30 天内我们品牌与前三大竞品的声量份额。" } },
  { en: { title: "Find trending topics",      desc: "Identify emerging conversations in your industry.",                  query: "What topics are trending in our industry this week?" },
    zh: { title: "发现趋势话题",               desc: "识别行业相关的新兴对话和热点。",                                     query: "本周我们行业内有哪些话题正在快速升温？" } },
];

const SUGGESTED = {
  en: ["What do users say about our product quality?", "Summarize negative feedback from the past 30 days", "Compare brand sentiment with top 3 competitors", "What features are users requesting most?"],
  zh: ["用户对我们产品质量有哪些评价？", "总结过去 30 天的负面反馈", "与前三大竞品的品牌情感对比", "用户最希望增加哪些功能？"],
};

const MOCK = {
  en: {
    default: "Based on selected data sources, I've analyzed recent conversations about your brand:\n\n• 68% positive — users praise product quality and service.\n• 12% negative — pain points: delivery times, pricing.\n• 20% neutral — general mentions and news.\n\nWould you like a deeper breakdown by platform or time period?",
    sentiment: "Sentiment across selected platforms:\n\nPositive (68%): Users love design and ease of use. Top phrases: \"highly recommend\", \"great value\", \"fast delivery\".\n\nNeutral (20%): Factual news and comparison articles.\n\nNegative (12%): Shipping delays, after-sales support. Mostly on 微博 and 小红书.",
  },
  zh: {
    default: "基于已选数据源分析近期关于你品牌的对话：\n\n• 68% 正面 —— 用户称赞产品质量和客服。\n• 12% 负面 —— 主要痛点：发货时间、定价。\n• 20% 中性 —— 一般提及和新闻报道。\n\n需要按平台或时间段进行更深入的分析吗？",
    sentiment: "各平台情感分析：\n\n正面（68%）：用户对设计和易用性评价很高。高频词：「强烈推荐」、「性价比高」、「发货快」。\n\n中性（20%）：新闻报道中的客观提及。\n\n负面（12%）：发货延迟和售后问题，多见于微博和小红书。",
  },
};

type Msg = { role: "user" | "assistant"; text: string };

export function DemoExplore() {
  const { language } = useLanguage();
  const zh = language === "zh";
  const lang = zh ? "zh" : "en";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function send(text?: string) {
    const q = (text ?? query).trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuery("");
    setLoading(true);
    setTimeout(() => {
      const key = q.includes("sentiment") || q.includes("情感") ? "sentiment" : "default";
      setMessages((m) => [...m, { role: "assistant", text: MOCK[lang][key] }]);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <>
            {/* Welcome */}
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #7c3aed, ${TEAL})` }}>
                <TrendingUp size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{zh ? "Meltwatch 智能探索" : "Meltwatch AI Explore"}</h2>
              <p className="text-sm text-gray-500">{zh ? "我是你的 AI 搜索助手，帮助你创建和优化搜索。" : "I am your AI search assistant. I will help you create and refine searches."}</p>
            </div>

            {/* Search type cards */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
              {[
                { en: "Create brand search",    zh: "创建品牌搜索",  enDesc: "Discover mentions and insights about your brand or products.", zhDesc: "发现有关你品牌或产品的提及和见解。" },
                { en: "Create industry search", zh: "创建行业搜索",  enDesc: "Understand market trends, consumer behavior, and industry news.", zhDesc: "了解市场趋势、消费者行为和行业新闻。" },
              ].map((c) => (
                <button key={c.en} onClick={() => send(zh ? c.zhDesc : c.enDesc)} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left hover:shadow-md hover:border-[#2BB7B8]/30 transition-all">
                  <h3 className="font-semibold text-gray-900 mb-2">{zh ? c.zh : c.en}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{zh ? c.zhDesc : c.enDesc}</p>
                </button>
              ))}
            </div>

            {/* Suggested queries */}
            <div className="max-w-2xl mx-auto w-full space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{zh ? "推荐查询" : "Suggested queries"}</p>
              {SUGGESTED[lang].map((q) => (
                <button key={q} onClick={() => send(q)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-sm text-gray-700 text-left transition-all group">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TEAL }} />
                  {q}
                  <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-[#2BB7B8] transition-colors" />
                </button>
              ))}
            </div>

            {/* Quick actions */}
            <div className="max-w-2xl mx-auto w-full">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{zh ? "快速操作" : "Quick actions"}</p>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_ACTIONS.map((a) => {
                  const action = a[lang];
                  return (
                    <button key={action.title} onClick={() => send(action.query)} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left hover:shadow-md transition-all group">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-[#2BB7B8] transition-colors">{action.title}</h3>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-line ${msg.role === "user" ? "text-white ml-8" : "bg-white border border-gray-100 shadow-sm text-gray-700 mr-8"}`}
              style={msg.role === "user" ? { backgroundColor: TEAL } : {}}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 flex gap-1.5">
              {[0, 0.2, 0.4].map((d) => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: TEAL, animationDelay: `${d}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 px-5 py-3 focus-within:border-[#2BB7B8] transition-colors">
            <textarea ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={zh ? "向 AI 提问..." : "Message AI Search Assistant"}
              rows={1} className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none leading-relaxed" />
            <button onClick={() => send()} disabled={!query.trim()} className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-40" style={{ backgroundColor: TEAL }}>
              <Send size={14} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">{zh ? "AI 可能出错，请以实际数据为准。" : "The AI Search Assistant can make mistakes."}</p>
        </div>
      </div>
    </div>
  );
}
