import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, MoreHorizontal, Download, Sparkles, ChevronRight } from "lucide-react";

const TEAL = "#2BB7B8";

const INSIGHT_REPORTS = [
  {
    id: 1,
    en: "Electric Vehicle Topics - Q3 2024", zh: "电动车话题 - 2024 Q3",
    author: "Maia Clinch",   created: "Oct 10, 2024", edited: "Oct 15, 2024",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #1e3a5f 100%)",
  },
  {
    id: 2,
    en: "Insight Report - Jun 2024",         zh: "洞察报告 - 2024年6月",
    author: "Ayesha Wallia", created: "Jul 10, 2024",  edited: "Sep 13, 2024",
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #1e40af 100%)",
  },
  {
    id: 3,
    en: "Insight Report - Q1 2024",          zh: "洞察报告 - 2024 Q1",
    author: "Ella Soares",   created: "May 28, 2024",  edited: "Sep 13, 2024",
    gradient: "linear-gradient(135deg, #64748b 0%, #0f172a 100%)",
    overlay: true,
  },
];

const SUGGESTIONS_EN = ["Increase brand share of voice", "Competitive benchmark", "Market entry strategy", "Crisis response plan", "Content amplification"];
const SUGGESTIONS_ZH = ["提升品牌声量份额", "竞品对标分析", "市场进入策略", "危机公关预案", "内容放大策略"];

const STRATEGY_REPORT = {
  en: {
    summary: "Based on current brand monitoring data, your brand holds a 38.2% share of voice in the EV sector, up 2.4% from the previous period. The primary growth opportunity lies in expanding positive sentiment in English-speaking markets, where competitors show weaker positioning. AI analysis of 1,150 recent mentions identifies three key strategic pillars.",
    opportunities: [
      "Battery technology narrative leads sentiment (+62% positive) — amplify through editorial seeding",
      "Competitor Halcyon Co. shows declining share (-1.1%) — capture audience with targeted content",
      "UK and Australian markets show highest engagement rates with lowest competition density",
      "Influencer mentions in the 100K–1M follower tier generate 4.2× average engagement vs. direct brand content",
    ],
    recommendations: [
      { title: "Strengthen technical thought leadership", body: "Publish 2–3 monthly deep-dive articles on battery innovation. Target publications: Insider Tracking, Yahoo Canada, WhaTech where editorial sources are already active." },
      { title: "Activate UK & Australia geo-strategy", body: "London and Toronto show the highest location-based mention density. Allocate 30% of paid amplification budget to these markets in Q4." },
      { title: "Accelerate influencer co-creation program", body: "Partner with 5–8 EV-focused creators in the 100K–500K tier across X and YouTube. Focus on battery range and charging experience content." },
      { title: "Monitor and counter competitor moves", body: "Set up real-time alerts for Halcyon Co. product announcements. Prepare rapid-response content templates for each scenario." },
    ],
    kpis: [
      { label: "Share of Voice target", value: "42% (+3.8pp)" },
      { label: "Positive sentiment rate", value: "≥ 72%" },
      { label: "UK/AU mention growth", value: "+25% QoQ" },
      { label: "Influencer reach", value: "50M impressions" },
    ],
    timeline: [
      { phase: "Week 1–2", task: "Brief editorial partners, brief influencer tier-1 outreach" },
      { phase: "Week 3–4", task: "Launch UK/AU geo campaigns, publish first thought-leadership piece" },
      { phase: "Month 2",  task: "Review mid-point metrics, optimize content mix" },
      { phase: "Month 3",  task: "Full report and strategy recalibration" },
    ],
  },
  zh: {
    summary: "根据当前品牌监测数据，您的品牌在电动车赛道声量份额为 38.2%，较上期提升 2.4%。主要增长机会在于扩大英语市场正面情感，竞品在该区域定位较弱。AI 对近 1,150 条提及的分析识别出三大核心战略支柱。",
    opportunities: [
      "电池技术叙事正面情感领先（+62%）—— 通过编辑内容播种放大",
      "竞品 Halcyon Co. 声量下滑（-1.1%）—— 以定向内容抢占其受众",
      "英国和澳大利亚市场互动率高，竞争密度低",
      "粉丝量 100K–1M 的网红提及互动率是品牌直发内容的 4.2 倍",
    ],
    recommendations: [
      { title: "强化技术思想领导力", body: "每月发布 2–3 篇电池创新深度文章，目标媒体为 Insider Tracking、Yahoo Canada、WhaTech 等已有活跃编辑来源的平台。" },
      { title: "激活英国和澳大利亚地区策略", body: "伦敦和多伦多提及密度最高。将 Q4 付费放大预算的 30% 分配至上述两个市场。" },
      { title: "加速网红共创计划", body: "与 5–8 位粉丝量 100K–500K 的电动车垂类创作者合作，聚焦于 X 和 YouTube 平台，内容方向为续航和充电体验。" },
      { title: "监测并反制竞品动作", body: "为 Halcyon Co. 新品发布设置实时提醒，提前准备各场景的快速响应内容模板。" },
    ],
    kpis: [
      { label: "声量份额目标", value: "42%（+3.8pp）" },
      { label: "正面情感目标", value: "≥ 72%" },
      { label: "英国/澳洲提及增长", value: "+25% QoQ" },
      { label: "网红触达量", value: "5000万曝光" },
    ],
    timeline: [
      { phase: "第1–2周", task: "对接编辑合作方，启动第一梯队网红触达" },
      { phase: "第3–4周", task: "启动英国/澳洲地区投放，发布首篇思想领导力内容" },
      { phase: "第2月",   task: "评估中期指标，优化内容组合" },
      { phase: "第3月",   task: "完整复盘报告与策略再校准" },
    ],
  },
};

export function DemoReport() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const [activeTab,      setActiveTab]      = useState<"insight" | "strategy">("insight");
  const [strategyInput,  setStrategyInput]  = useState("");
  const [genState,       setGenState]       = useState<"idle" | "loading" | "done">("idle");
  const [selectedChip,   setSelectedChip]   = useState<string | null>(null);

  const suggestions = zh ? SUGGESTIONS_ZH : SUGGESTIONS_EN;
  const report      = zh ? STRATEGY_REPORT.zh : STRATEGY_REPORT.en;

  function handleGenerate() {
    const text = strategyInput.trim() || selectedChip;
    if (!text) return;
    setGenState("loading");
    setTimeout(() => setGenState("done"), 1400);
  }
  function handleReset() {
    setGenState("idle");
    setStrategyInput("");
    setSelectedChip(null);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F6F7]">

      {/* ── Tab bar ── */}
      <div className="flex items-center border-b border-gray-200 bg-white px-6">
        {(["insight", "strategy"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab ? "font-semibold" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
            style={activeTab === tab ? { color: TEAL, borderColor: TEAL } : {}}
          >
            {tab === "insight"
              ? (zh ? "用户洞察报告" : "Insight Reports")
              : (zh ? "策略报告" : "Strategy Reports")}
          </button>
        ))}
      </div>

      {/* ══ INSIGHT REPORTS TAB ══ */}
      {activeTab === "insight" && (
        <div className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{zh ? "用户洞察报告" : "Insight Reports"}</h2>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: TEAL }}>
              {zh ? "+ 创建报告" : "Create report"}
            </button>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Subtitle */}
            <p className="text-xs text-center" style={{ color: TEAL }}>
              <a href="#" className="underline underline-offset-2">
                {zh ? "点击此处访问旧版洞察报告" : "Click here to access your reports in the previous version of Insight Reports"}
              </a>
            </p>

            {/* Hero text */}
            <h3 className="text-xl font-semibold text-gray-800 text-center">
              {zh ? "创建洞察报告或重新查看已保存的报告" : "Create an Insight Report or revisit a saved report"}
            </h3>

            {/* Recently edited */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{zh ? "最近编辑的报告" : "Recently edited reports"}</h4>
              <div className="grid grid-cols-3 gap-4">
                {INSIGHT_REPORTS.map(r => (
                  <div key={r.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    {/* Thumbnail */}
                    <div className="h-36 relative overflow-hidden" style={{ background: r.gradient }}>
                      {r.overlay && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-lg px-4 py-2 text-white text-sm font-semibold text-center">
                            {zh ? r.zh : r.en}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Meta */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-[#2BB7B8] transition-colors">{zh ? r.zh : r.en}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{r.edited}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All reports table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">{zh ? "全部洞察报告" : "All Insight Reports"}</span>
                <Search size={15} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium">
                    <th className="px-5 py-3 text-left w-8"><input type="checkbox" className="rounded" readOnly /></th>
                    <th className="px-4 py-3 text-left">{zh ? "名称" : "Name"}</th>
                    <th className="px-4 py-3 text-left">{zh ? "创建者" : "Created by"}</th>
                    <th className="px-4 py-3 text-left">{zh ? "创建日期" : "Date created"}</th>
                    <th className="px-4 py-3 text-left">{zh ? "最后编辑" : "Last edited"}</th>
                    <th className="px-4 py-3 text-left">{zh ? "计划" : "Schedule"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {INSIGHT_REPORTS.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5"><input type="checkbox" className="rounded" readOnly /></td>
                      <td className="px-4 py-3.5 font-medium text-gray-800">{zh ? r.zh : r.en}</td>
                      <td className="px-4 py-3.5 text-gray-500">{r.author}</td>
                      <td className="px-4 py-3.5 text-gray-500">{r.created}</td>
                      <td className="px-4 py-3.5 text-gray-500">{r.edited}</td>
                      <td className="px-4 py-3.5 text-gray-400">--</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-end px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
                1-3 {zh ? "/ 共 3 条" : "of 3"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ STRATEGY REPORTS TAB ══ */}
      {activeTab === "strategy" && (
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {genState === "idle" || genState === "loading" ? (
            /* ── Input form ── */
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="text-center py-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {zh ? "AI 策略报告生成" : "AI Strategy Report"}
                </h3>
                <p className="text-sm text-gray-500">
                  {zh
                    ? "描述您希望分析的策略方向，AI 将基于品牌监测数据生成定制化策略建议"
                    : "Describe your strategy objective and AI will generate tailored recommendations based on your brand data"}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {zh ? "策略目标描述" : "Strategy objective"}
                </label>
                <textarea
                  rows={4}
                  value={strategyInput}
                  onChange={e => setStrategyInput(e.target.value)}
                  placeholder={zh
                    ? "例如：如何提升品牌在年轻消费者群体中的好感度，并扩大在东南亚市场的声量份额…"
                    : "e.g. How can we increase brand preference among younger consumers and expand share of voice in Southeast Asian markets…"}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none transition-colors leading-relaxed"
                  onFocus={e => (e.target.style.borderColor = TEAL)}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />

                <div>
                  <p className="text-xs text-gray-400 mb-2">{zh ? "快速选择策略方向：" : "Quick suggestions:"}</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => { setSelectedChip(s); setStrategyInput(s); }}
                        className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                        style={selectedChip === s
                          ? { borderColor: TEAL, color: TEAL, backgroundColor: `${TEAL}12` }
                          : { borderColor: "#e5e7eb", color: "#6b7280" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={genState === "loading" || (!strategyInput.trim() && !selectedChip)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: TEAL }}
                >
                  {genState === "loading" ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      {zh ? "AI 分析中…" : "Generating…"}
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      {zh ? "生成策略报告" : "Generate Strategy Report"}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ── Generated report ── */
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Report header */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} style={{ color: TEAL }} />
                    <span className="text-xs font-semibold" style={{ color: TEAL }}>{zh ? "AI 生成策略报告" : "AI-Generated Strategy Report"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{strategyInput || selectedChip}</h3>
                  <p className="text-xs text-gray-400 mt-1">{zh ? "基于品牌监测数据 · 今天生成" : "Based on brand monitoring data · Generated today"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download size={12} />{zh ? "导出" : "Export"}
                  </button>
                  <button onClick={handleReset} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    {zh ? "重新生成" : "New report"}
                  </button>
                </div>
              </div>

              {/* Executive summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">{zh ? "执行摘要" : "Executive Summary"}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{report.summary}</p>
              </div>

              {/* Opportunities */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">{zh ? "市场机会分析" : "Market Opportunity Analysis"}</h4>
                <ul className="space-y-2">
                  {report.opportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: TEAL }} />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">{zh ? "战略建议" : "Strategic Recommendations"}</h4>
                <div className="space-y-4">
                  {report.recommendations.map((r, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: TEAL }}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">{r.title}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">{zh ? "KPI 与成功指标" : "KPIs & Success Metrics"}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {report.kpis.map((k, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-4" style={{ backgroundColor: `${TEAL}08` }}>
                      <p className="text-2xl font-bold" style={{ color: TEAL }}>{k.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">{zh ? "行动时间线" : "Action Timeline"}</h4>
                <div className="space-y-3">
                  {report.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <span className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: TEAL }} />
                        {i < report.timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: `${TEAL}30`, minHeight: "20px" }} />}
                      </div>
                      <div className="pb-2">
                        <span className="text-xs font-semibold" style={{ color: TEAL }}>{t.phase}</span>
                        <p className="text-sm text-gray-600 mt-0.5">{t.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer action */}
              <div className="flex items-center justify-center gap-3 py-2">
                <button className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: TEAL }}>
                  {zh ? "查看完整报告" : "View full report"} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
