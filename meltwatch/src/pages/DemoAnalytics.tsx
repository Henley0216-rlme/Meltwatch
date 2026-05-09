import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, Search, Download, ThumbsUp, ThumbsDown, RefreshCw, Copy, ArrowUpDown, Filter, Tag, Check, Info, ExternalLink, Upload, type LucideIcon } from "lucide-react";

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

const LANGUAGES = [
  { id: "zh", label: "中文 (简体)" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "de", label: "Deutsch" },
  { id: "fr", label: "Français" },
  { id: "ko", label: "한국어" },
];

const LOCATIONS = [
  { id: "cn", label: "China" },
  { id: "us", label: "United States" },
  { id: "jp", label: "Japan" },
  { id: "de", label: "Germany" },
  { id: "gb", label: "United Kingdom" },
  { id: "au", label: "Australia" },
  { id: "fr", label: "France" },
];

const SENTIMENTS = [
  { id: "positive", en: "Positive", zh: "正面", color: "#16A34A" },
  { id: "neutral",  en: "Neutral",  zh: "中性", color: "#9CA3AF" },
  { id: "negative", en: "Negative", zh: "负面", color: "#DC2626" },
];

const CUSTOM_CATEGORIES = [
  { id: "battery",  en: "Battery Life",  zh: "电池续航" },
  { id: "charging", en: "Charging",      zh: "充电" },
  { id: "safety",   en: "Safety",        zh: "安全" },
  { id: "price",    en: "Pricing",       zh: "定价" },
  { id: "brand",    en: "Brand Image",   zh: "品牌形象" },
];

const FILTER_SETS = [
  { id: "default",  en: "Default",        zh: "默认" },
  { id: "brand",    en: "Brand only",     zh: "仅品牌" },
  { id: "comp",     en: "Competitors",    zh: "竞品" },
  { id: "crisis",   en: "Crisis watch",   zh: "危机监测" },
];

const TABS = [
  { id: "volume",     en: "Volume",     zh: "声量" },
  { id: "narrative",  en: "Narrative",  zh: "叙事" },
  { id: "sentiment",  en: "Sentiment",  zh: "情感" },
  { id: "engagement", en: "Engagement", zh: "互动" },
];

const ARTICLES = [
  {
    id: 1, platform: "微博",
    sourceType: { en: "News", zh: "新闻" }, country: "CN", time: "yesterday · 6:58 PM",
    title: { en: "Battery X Metals' LIBRT engages patent firm for EV battery diagnostic software", zh: "Battery X Metals旗下LIBRT委托专利事务所为电动车电池诊断软件申请专利" },
    tags: ["battery life", "electric vehicle"], filterTag: "Battery Life", sentiment: "neutral", reach: "1.15k", hasMedia: true,
  },
  {
    id: 2, platform: "小红书",
    sourceType: { en: "News", zh: "新闻" }, country: "GB", time: "2h ago",
    title: { en: "The UK Charging Infrastructure Symposium covers latest EV developments", zh: "英国充电基础设施研讨会深度解析最新电动车发展动态" },
    tags: ["electric vehicle", "charging"], filterTag: "Battery Life", sentiment: "positive", reach: "260", hasMedia: false,
  },
  {
    id: 3, platform: "X",
    sourceType: { en: "Social", zh: "社交" }, country: "US", time: "4h ago",
    title: { en: "Consumer EV adoption accelerates in Q4, survey shows strong battery satisfaction", zh: "Q4消费者电动车采用率加速，调查显示电池满意度显著提升" },
    tags: ["consumer", "electric vehicle"], filterTag: "Consumer", sentiment: "positive", reach: "890", hasMedia: false,
  },
  {
    id: 4, platform: "抖音",
    sourceType: { en: "Social", zh: "社交" }, country: "CN", time: "6h ago",
    title: { en: "New competitor launches premium EV line targeting luxury consumers", zh: "新竞品发布高端电动车系列，精准瞄准豪华消费者市场" },
    tags: ["competitor", "electric vehicle"], filterTag: "Competitor", sentiment: "neutral", reach: "2.3k", hasMedia: true,
  },
];

const TREND = [8,6,10,8,12,9,11,14,10,13,18,14,16,22,18,15,20,25,22,28,24,30,28,35,32,38,42,40,48,45,52,50,120,45,40,38,35,32,30,28,30,28,25,28,22];
const X_LABELS = ["Sep 1","Sep 5","Sep 9","Sep 13","Sep 17","Sep 21","Sep 25","Sep 29","Oct 3","Oct 7"];
const CHART_W = 480, CHART_H = 140, Y_MAX = 150, SPIKE_IDX = 32;
const cx = (i: number) => (i / (TREND.length - 1)) * CHART_W;
const cy = (v: number) => CHART_H - (v / Y_MAX) * CHART_H;
const toPolyline = () => TREND.map((v, i) => `${cx(i)},${cy(v)}`).join(" ");
const toArea = () => `0,${CHART_H} ${toPolyline()} ${CHART_W},${CHART_H}`;

const SENTIMENT_COLOR: Record<string, string> = { positive: "#16A34A", neutral: "#9CA3AF", negative: "#DC2626" };

// ── Source-type trend (51 pts, Sep 1 – Oct 21) ────────────────────────────
const ST_N = 51;
const ST_BROADCAST = [12,10,15,18,48,14,12,10,8,35,28,30,32,38,18,10,12,35,28,16,12,20,26,8,12,35,50,18,14,12,15,18,25,108,8,6,32,28,45,22,20,30,35,22,18,26,24,18,25,28,22];
const ST_X         = [8,8,12,14,30,10,8,12,8,25,22,26,28,35,14,8,10,28,22,12,10,16,20,6,10,28,38,14,12,10,12,14,20,35,6,5,28,22,38,18,16,25,28,18,14,20,18,14,20,22,18];
const ST_FORUMS    = [3,2,4,5,8,3,2,4,3,6,5,7,8,9,4,2,3,8,6,3,3,5,6,2,3,8,10,4,3,3,4,4,6,12,2,2,8,6,10,5,4,7,8,5,4,6,5,4,6,7,5];
const ST_BLOGS     = [1,1,1,2,2,1,1,1,1,2,2,2,2,2,1,1,1,2,2,1,1,2,2,1,1,2,2,1,1,1,1,1,2,3,1,1,2,2,2,1,1,2,2,1,1,2,1,1,2,2,1];
const ST_COMMENTS  = [1,1,2,2,3,1,1,2,1,3,2,3,3,3,2,1,1,3,2,1,1,2,2,1,1,3,3,2,1,1,2,2,2,4,1,1,3,3,3,2,1,2,3,2,1,2,2,1,2,2,2];
const ST_X_LABELS  = ["Sep 1","Sep 5","Sep 9","Sep 13","Sep 17","Sep 21","Sep 25","Sep 29","Oct 3","Oct 7","Oct 11","Oct 15","Oct 19","Oct 21"];
const stcx = (i: number) => (i / (ST_N - 1)) * CHART_W;
function toSTLine(pts: number[]) { return pts.map((v, i) => `${stcx(i)},${cy(v)}`).join(" "); }

// ── Analytics panel static data ───────────────────────────────────────────
const TOP_LOCS = [
  { name: "London",    count: 192 },
  { name: "Toronto",   count: 50  },
  { name: "Vancouver", count: 47  },
  { name: "Subiaco",   count: 30  },
  { name: "Mt Macedon",count: 25  },
  { name: "Québec",    count: 19  },
  { name: "Kew East",  count: 19  },
  { name: "Eveleigh",  count: 18  },
  { name: "Stanmore",  count: 18  },
  { name: "Sydney CBD",count: 15  },
];

const EDIT_SOURCES = [
  { initials: "YC", bg: "#C2713A", name: "Yahoo! Canada",                           count: 25 },
  { initials: "W",  bg: "#6B7280", name: "WhaTech",                                  count: 25 },
  { initials: "IT", bg: "#7C3AED", name: "Insider Tracking",                         count: 20 },
  { initials: "LL", bg: "#3B82F6", name: "Le Lézard",                                count: 19 },
  { initials: "KD", bg: "#0D9488", name: "Kelowna Daily Courier - FinancialContent", count: 17 },
  { initials: "CI", bg: "#2563EB", name: "Canadian Insider",                          count: 15 },
  { initials: "TW", bg: "#374151", name: "Theweekenddrive - Prnewswire",              count: 15 },
];

const SHARED_LINKS = [
  { url: "mailto:media@technavio.com",               count: 33 },
  { url: "insidermonkey.com/blog/15-best-hu...",     count: 26 },
  { url: "insidermonkey.com/blog/jim-cramer...",     count: 26 },
  { url: "insidermonkey.com/premium/newsle...",      count: 26 },
  { url: "nrma.com.au/car-insurance/ev-repor...",    count: 26 },
  { url: "carexpert.com.au/new-car-deals/",          count: 25 },
  { url: "electricdrives.tv/high-mileage-tesla-...", count: 23 },
];

const FORUM_DATA = [
  { url: "mgevs.com",              count: 5 },
  { url: "thefarmingforum.co.uk",  count: 3 },
  { url: "stockwatch.com",         count: 2 },
  { url: "mbclub.co.uk",           count: 1 },
  { url: "nationaltribune.com.au", count: 1 },
  { url: "overclockers.co.uk",     count: 1 },
  { url: "redflagdeals.com",       count: 1 },
];

// ── Shared UI helpers ─────────────────────────────────────────────────────
function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <Info size={13} className="text-gray-400" />
      </div>
      <div className="flex items-center gap-2 text-gray-400">{right ?? <Download size={13} className="hover:text-gray-600 cursor-pointer transition-colors" />}</div>
    </div>
  );
}

function Pager({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 py-3 border-t border-gray-50 text-xs text-gray-500 select-none">
      <button className="hover:text-gray-700 transition-colors">‹</button>
      <span>{label}</span>
      <button className="hover:text-gray-700 transition-colors">›</button>
    </div>
  );
}

// ── Reusable dropdown wrapper ──────────────────────────────────────────────
function FilterDropdown({
  label, icon: Icon, open, onToggle, children, wide,
}: {
  label: string;
  icon?: LucideIcon;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded transition-colors hover:bg-gray-50"
        style={{ color: open ? TEAL : "#374151" }}
      >
        {Icon && <Icon size={13} className="flex-shrink-0" />}
        {label}
        <ChevronDown size={11} className={`ml-0.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ${wide ? "w-72" : "w-52"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function CheckRow({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
    >
      <span className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${checked ? "border-transparent" : "border-gray-300"}`}
        style={checked ? { backgroundColor: TEAL } : {}}>
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

export function DemoAnalytics() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const [activeTab, setActiveTab]   = useState("volume");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sources,    setSources]    = useState<Set<string>>(new Set(["x","facebook","xiaohongshu","douyin","weixin","weibo"]));
  const [langs,      setLangs]      = useState<Set<string>>(new Set(["zh","en"]));
  const [locs,       setLocs]       = useState<Set<string>>(new Set(["cn","us","jp"]));
  const [sents,      setSents]      = useState<Set<string>>(new Set(["positive","neutral","negative"]));
  const [customCats, setCustomCats] = useState<Set<string>>(new Set(["battery"]));
  const [filterSet,  setFilterSet]  = useState("default");

  function toggleFilter(name: string) {
    setOpenFilter(p => p === name ? null : name);
  }
  function toggleSet<T>(set: Set<T>, val: T): Set<T> {
    const n = new Set(set); n.has(val) ? n.delete(val) : n.add(val); return n;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white" onClick={() => setOpenFilter(null)}>

      {/* ── Filter bar ── */}
      <div className="flex items-center px-2 border-b border-gray-100 bg-white" onClick={e => e.stopPropagation()}>

        {/* Filter set */}
        <FilterDropdown
          label={zh ? "筛选组" : "Filter set"}
          icon={Filter}
          open={openFilter === "filterset"}
          onToggle={() => toggleFilter("filterset")}
        >
          <div className="py-1.5">
            {FILTER_SETS.map(f => (
              <button key={f.id} onClick={() => { setFilterSet(f.id); setOpenFilter(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${filterSet === f.id ? "font-semibold" : "text-gray-600"}`}
                style={filterSet === f.id ? { color: TEAL } : {}}>
                {zh ? f.zh : f.en}
                {filterSet === f.id && <Check size={12} style={{ color: TEAL }} />}
              </button>
            ))}
          </div>
        </FilterDropdown>

        <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Source type */}
        <FilterDropdown
          label={sources.size < DATA_SOURCES.length
            ? (zh ? `来源类型 (${sources.size})` : `Source type (${sources.size})`)
            : (zh ? "来源类型" : "Source type")}
          open={openFilter === "source"}
          onToggle={() => toggleFilter("source")}
          wide
        >
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">{zh ? "选择数据来源" : "Select sources"}</span>
            <div className="flex gap-2 text-[11px]">
              <button onClick={() => setSources(new Set(DATA_SOURCES.map(d => d.id)))} className="text-gray-400 hover:text-gray-700 transition-colors">{zh ? "全选" : "All"}</button>
              <button onClick={() => setSources(new Set())} className="text-gray-400 hover:text-gray-700 transition-colors">{zh ? "清空" : "Clear"}</button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {DATA_SOURCES.map(src => (
              <CheckRow key={src.id} checked={sources.has(src.id)} onToggle={() => setSources(s => toggleSet(s, src.id))}>
                <img src={src.src} alt={src.label} className="w-4 h-4 object-contain flex-shrink-0" />
                <span className="text-xs text-gray-700">{src.label}</span>
              </CheckRow>
            ))}
          </div>
          <div className="border-t border-gray-100 p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) setUploadedFile(file.name);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 border border-dashed border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Upload size={12} className="flex-shrink-0" style={{ color: TEAL }} />
              <span className="truncate">{uploadedFile ?? (zh ? "上传自定义数据源" : "Upload custom source")}</span>
            </button>
          </div>
        </FilterDropdown>

        {/* Language */}
        <FilterDropdown
          label={langs.size < LANGUAGES.length
            ? (zh ? `语言 (${langs.size})` : `Language (${langs.size})`)
            : (zh ? "语言" : "Language")}
          open={openFilter === "lang"}
          onToggle={() => toggleFilter("lang")}
        >
          <div className="py-1">
            {LANGUAGES.map(l => (
              <CheckRow key={l.id} checked={langs.has(l.id)} onToggle={() => setLangs(s => toggleSet(s, l.id))}>
                <span className="text-xs text-gray-700">{l.label}</span>
              </CheckRow>
            ))}
          </div>
        </FilterDropdown>

        {/* Location */}
        <FilterDropdown
          label={locs.size > 0
            ? (zh ? `地区 (${locs.size})` : `Location (${locs.size})`)
            : (zh ? "地区" : "Location")}
          open={openFilter === "loc"}
          onToggle={() => toggleFilter("loc")}
        >
          <div className="py-1">
            {LOCATIONS.map(l => (
              <CheckRow key={l.id} checked={locs.has(l.id)} onToggle={() => setLocs(s => toggleSet(s, l.id))}>
                <span className="text-xs text-gray-700">{l.label}</span>
              </CheckRow>
            ))}
          </div>
        </FilterDropdown>

        {/* Keyword */}
        <FilterDropdown
          label={zh ? "关键词" : "Keyword"}
          open={openFilter === "kw"}
          onToggle={() => toggleFilter("kw")}
        >
          <div className="p-3">
            <p className="text-[10px] text-gray-400 mb-2">{zh ? "输入关键词，按回车确认" : "Enter keyword and press Enter"}</p>
            <input
              autoFocus
              type="text"
              placeholder={zh ? "如：电动车、续航…" : "e.g. electric vehicle…"}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
              onFocus={e => (e.target.style.borderColor = TEAL)}
              onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["battery life", "electric vehicle", "consumer"].map(kw => (
                <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ borderColor: TEAL, color: TEAL, backgroundColor: `${TEAL}10` }}>
                  {kw} ×
                </span>
              ))}
            </div>
          </div>
        </FilterDropdown>

        {/* Sentiment */}
        <FilterDropdown
          label={sents.size < SENTIMENTS.length
            ? (zh ? `情感 (${sents.size})` : `Sentiment (${sents.size})`)
            : (zh ? "情感" : "Sentiment")}
          open={openFilter === "sent"}
          onToggle={() => toggleFilter("sent")}
        >
          <div className="py-1">
            {SENTIMENTS.map(s => (
              <CheckRow key={s.id} checked={sents.has(s.id)} onToggle={() => setSents(st => toggleSet(st, s.id))}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-gray-700">{zh ? s.zh : s.en}</span>
              </CheckRow>
            ))}
          </div>
        </FilterDropdown>

        {/* Custom categories */}
        <FilterDropdown
          label={customCats.size > 0
            ? (zh ? `自定义分类 (${customCats.size})` : `Custom categories (${customCats.size})`)
            : (zh ? "自定义分类" : "Custom categories")}
          open={openFilter === "custom"}
          onToggle={() => toggleFilter("custom")}
        >
          <div className="py-1">
            {CUSTOM_CATEGORIES.map(c => (
              <CheckRow key={c.id} checked={customCats.has(c.id)} onToggle={() => setCustomCats(s => toggleSet(s, c.id))}>
                <span className="text-xs text-gray-700">{zh ? c.zh : c.en}</span>
              </CheckRow>
            ))}
          </div>
        </FilterDropdown>

        {/* Search button */}
        <button className="ml-auto flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90 transition-opacity flex-shrink-0" style={{ backgroundColor: TEAL }}>
          {zh ? "搜索" : "Search"}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center border-b border-gray-100 px-4 bg-white">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id ? "font-semibold" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
            style={activeTab === tab.id ? { color: TEAL, borderColor: TEAL } : {}}
          >
            {zh ? tab.zh : tab.en}
          </button>
        ))}
      </div>

      {/* ── Split content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: article list */}
        <div className="w-[360px] flex-shrink-0 border-r border-gray-100 flex flex-col overflow-hidden bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
            <input type="checkbox" className="rounded w-3.5 h-3.5" readOnly />
            <span className="text-xs font-semibold text-gray-700">1.15k {zh ? "结果" : "Results"}</span>
            <button className="flex items-center gap-1 ml-1 px-2 py-1 rounded border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Tag size={11} style={{ color: TEAL }} />{zh ? "AI 标签" : "AI Tags"}
            </button>
            <Download size={14} className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
            <span className="text-[11px] text-gray-500">{zh ? "排序：" : "Sorted by:"}</span>
            <button className="flex items-center gap-1 text-[11px] font-medium text-gray-700">
              {zh ? "日期" : "Date"} <ArrowUpDown size={10} />
            </button>
            <Search size={13} className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {ARTICLES.map(a => (
              <div key={a.id} className="px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                {a.hasMedia && (
                  <div className="w-full h-24 bg-gray-900 rounded-lg mb-2.5 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mb-1.5">{a.tags.join(", ")}</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{a.filterTag}</span>
                  <span className="ml-auto text-[10px] font-medium flex items-center gap-1" style={{ color: SENTIMENT_COLOR[a.sentiment] }}>
                    {a.sentiment === "positive" ? (zh ? "正面" : "Positive") : a.sentiment === "negative" ? (zh ? "负面" : "Negative") : (zh ? "中性" : "Neutral")}
                    <span className="w-1.5 h-1.5 rounded-full border" style={{ borderColor: SENTIMENT_COLOR[a.sentiment] }} />
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-800 leading-snug mb-1.5 line-clamp-2">{zh ? a.title.zh : a.title.en}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${TEAL}18`, color: TEAL }}>{a.platform}</span>
                    <span>{zh ? a.sourceType.zh : a.sourceType.en} | {a.country} | {a.time}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{a.reach} {zh ? "触达" : "Reach"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI insight + chart */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F5F6F7]">

          {/* AI-Powered Insight */}
          <div className="bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: "#7C3AED30" }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "#7C3AED" }}>✦ {zh ? "AI 驱动的洞察" : "AI-Powered Insight"}</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {zh
                ? "声量上升的原因是 Battery X Metals 旗下投资组合公司 LIBRT 委托领先专利律师事务所，为创新型电动车电池诊断与再平衡软硬件申请专利。这一消息在电动车行业及投资者群体中引发了显著关注与讨论。"
                : "The increase in volume is due to Battery X Metals' portfolio company LIBRT engaging a leading patent law firm to file patents for innovative EV battery diagnostic and rebalancing software and hardware. This news has generated significant interest and discussion in the EV industry and among investors."}
            </p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
              {[ThumbsUp, ThumbsDown, RefreshCw, Copy].map((Icon, i) => (
                <button key={i} className="text-gray-400 hover:text-gray-600 transition-colors"><Icon size={14} /></button>
              ))}
            </div>
          </div>

          {/* Mentions Trend */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">{zh ? "提及量趋势" : "Mentions Trend"}</h3>
              <Download size={14} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
            </div>
            <div className="flex gap-8 mb-5">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{zh ? "总提及数" : "Total Mentions"}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">1.15k</span>
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">↓ 21%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{zh ? "上期 1.46k" : "Previous period 1.46k"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{zh ? "日均提及" : "Daily Average"}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">22</span>
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">↓ 21%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{zh ? "上期 28" : "Previous period 28"}</p>
              </div>
            </div>
            <svg viewBox={`-32 -8 ${CHART_W + 40} ${CHART_H + 28}`} className="w-full">
              <defs>
                <linearGradient id="ci-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TEAL} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={TEAL} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0,25,50,75,100,125,150].map(v => (
                <g key={v}>
                  <line x1={0} y1={cy(v)} x2={CHART_W} y2={cy(v)} stroke="#f3f4f6" strokeWidth="1" />
                  <text x={-4} y={cy(v)+3.5} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
                </g>
              ))}
              <polygon points={toArea()} fill="url(#ci-grad)" />
              <polyline points={toPolyline()} fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={cx(SPIKE_IDX)} cy={cy(TREND[SPIKE_IDX])} r="5" fill="white" stroke={TEAL} strokeWidth="2" />
              {X_LABELS.map((label, i) => {
                const di = Math.round((i / (X_LABELS.length - 1)) * (TREND.length - 1));
                return <text key={label} x={cx(di)} y={CHART_H+16} textAnchor="middle" fontSize="8.5" fill="#9ca3af">{label}</text>;
              })}
            </svg>
          </div>

          {/* ── Mentions Trend by Source Type ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader title={zh ? "按来源类型的提及趋势" : "Mentions Trend by Source Type"} />
            <div className="px-5 pb-4 pt-3">
              <svg viewBox={`-32 -8 ${CHART_W + 40} ${CHART_H + 28}`} className="w-full">
                {[0,25,50,75,100,125].map(v => (
                  <g key={v}>
                    <line x1={0} y1={cy(v)} x2={CHART_W} y2={cy(v)} stroke="#f3f4f6" strokeWidth="1" />
                    <text x={-4} y={cy(v)+3.5} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
                  </g>
                ))}
                {[
                  { pts: ST_BROADCAST, color: "#3B82F6", w: 1.8 },
                  { pts: ST_X,         color: "#F59E0B", w: 1.8 },
                  { pts: ST_FORUMS,    color: "#10B981", w: 1.5 },
                  { pts: ST_BLOGS,     color: "#374151", w: 1.2 },
                  { pts: ST_COMMENTS,  color: "#9F1239", w: 1.2 },
                ].map(({ pts, color, w }) => (
                  <polyline key={color} points={toSTLine(pts)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {ST_X_LABELS.map((label, i) => {
                  const di = Math.round((i / (ST_X_LABELS.length - 1)) * (ST_N - 1));
                  return <text key={label} x={stcx(di)} y={CHART_H+16} textAnchor="middle" fontSize="8.5" fill="#9ca3af">{label}</text>;
                })}
              </svg>
              <div className="flex flex-wrap gap-5 mt-2">
                {[
                  { color: "#3B82F6", label: zh ? "广播" : "Broadcast", count: 275 },
                  { color: "#F59E0B", label: "X",                        count: 91  },
                  { color: "#10B981", label: zh ? "论坛" : "Forums",     count: 15  },
                  { color: "#374151", label: zh ? "博客" : "Blogs",      count: 1   },
                  { color: "#9F1239", label: zh ? "评论" : "Comments",   count: 1   },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="font-medium">{s.label}</span>
                    <span className="text-gray-400">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Top Locations + Top Editorial Sources ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Locations */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader
                title={zh ? "热门地区" : "Top Locations"}
                right={
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition-colors">
                      {zh ? "城市" : "City"} <ChevronDown size={10} />
                    </button>
                    <Download size={13} className="hover:text-gray-600 cursor-pointer transition-colors" />
                  </div>
                }
              />
              <div className="px-5 py-3 space-y-2">
                {TOP_LOCS.map(l => (
                  <div key={l.name} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 text-right w-20 flex-shrink-0 truncate">{l.name}</span>
                    <div className="flex-1 h-5 rounded overflow-hidden bg-gray-50">
                      <div className="h-full rounded" style={{ width: `${(l.count / 192) * 100}%`, backgroundColor: "#F59E0B", opacity: 0.8 }} />
                    </div>
                    <span className="text-xs text-gray-700 w-8 text-right flex-shrink-0">{l.count}</span>
                  </div>
                ))}
              </div>
              <Pager label={zh ? "1-10 / 35 个地区" : "1-10 of 35 Locations"} />
            </div>

            {/* Top Editorial Sources */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader title={zh ? "热门编辑来源" : "Top Editorial Sources"} />
              <div className="flex items-center px-5 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <span className="flex-1">{zh ? "媒体" : "Publications"}</span>
                <span>{zh ? "提及数" : "Mentions"}</span>
              </div>
              {EDIT_SOURCES.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: s.bg }}>
                    {s.initials}
                  </div>
                  <span className="flex-1 text-xs font-medium text-gray-800 truncate">{s.name}</span>
                  <span className="text-xs text-gray-600 flex-shrink-0">{s.count}</span>
                </div>
              ))}
              <Pager label={zh ? "1-7 / 30 个编辑来源" : "1-7 of 30 Editorial Sources"} />
            </div>
          </div>

          {/* ── Top Shared Links + Top Blogs ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Shared Links */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader title={zh ? "热门分享链接" : "Top Shared Links"} />
              <div className="flex items-center px-5 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <span className="flex-1">{zh ? "链接" : "URL Links"}</span>
                <span>{zh ? "提及数" : "Mentions"}</span>
              </div>
              {SHARED_LINKS.map((l, i) => (
                <div key={l.url} className="flex items-center gap-2.5 px-5 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="#6b7280" strokeWidth="1.5">
                      <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7 4" />
                      <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L9 12" />
                    </svg>
                  </div>
                  <span className="flex-1 text-xs text-gray-700 truncate">{l.url}</span>
                  <span className="text-xs text-gray-600 w-6 text-right flex-shrink-0">{l.count}</span>
                  <div className="w-px h-4 bg-gray-100 flex-shrink-0" />
                  <ExternalLink size={12} className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0 transition-colors" />
                </div>
              ))}
              <Pager label={zh ? "1-7 / 93 个分享链接" : "1-7 of 93 Shared Links"} />
            </div>

            {/* Top Blogs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader title={zh ? "热门博客" : "Top Blogs"} />
              <div className="flex items-center px-5 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <span className="flex-1">{zh ? "博客链接" : "Blog URLs"}</span>
                <span>{zh ? "提及数" : "Mentions"}</span>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <span className="text-xs text-gray-400 w-4 flex-shrink-0">1</span>
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-amber-700">PS</span>
                </div>
                <span className="flex-1 text-xs text-gray-700">philipshaw.ca</span>
                <span className="text-xs text-gray-600">1</span>
              </div>
              <Pager label={zh ? "1-1 / 1 个博客" : "1-1 of 1 Blog"} />
            </div>
          </div>

          {/* ── Top Subreddits + Top Forums ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Subreddits — empty state */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader title={zh ? "热门 Subreddits" : "Top Subreddits"} />
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <svg viewBox="0 0 120 90" className="w-28 h-auto mb-4">
                  <circle cx="60" cy="45" r="40" fill="#e5e7eb" />
                  <rect x="30" y="55" width="14" height="18" rx="2" fill="none" stroke="#9ca3af" strokeWidth="2" />
                  <rect x="52" y="38" width="14" height="35" rx="2" fill="none" stroke="#9ca3af" strokeWidth="2" />
                  <rect x="74" y="47" width="14" height="26" rx="2" fill="none" stroke="#9ca3af" strokeWidth="2" />
                  <path d="M20 72 Q60 36 100 55" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
                <p className="text-sm font-semibold text-gray-600 mb-1">{zh ? "未找到文档" : "No Documents found"}</p>
                <p className="text-xs text-gray-400">{zh ? "未找到结果，请调整搜索或日期范围" : "No results found, try adjusting your search or date range"}</p>
              </div>
            </div>

            {/* Top Forums */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <CardHeader title={zh ? "热门论坛" : "Top Forums"} />
              <div className="flex items-center px-5 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <span className="flex-1">{zh ? "论坛链接" : "Forum URLs"}</span>
                <span>{zh ? "提及数" : "Mentions"}</span>
              </div>
              {FORUM_DATA.map((f, i) => (
                <div key={f.url} className="flex items-center gap-2.5 px-5 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="#6b7280" strokeWidth="1.4">
                      <circle cx="8" cy="8" r="6.5" />
                      <circle cx="5.5" cy="8" r="1" fill="#6b7280" />
                      <circle cx="8"   cy="8" r="1" fill="#6b7280" />
                      <circle cx="10.5" cy="8" r="1" fill="#6b7280" />
                    </svg>
                  </div>
                  <span className="flex-1 text-xs text-gray-700">{f.url}</span>
                  <span className="text-xs text-gray-600 flex-shrink-0">{f.count}</span>
                </div>
              ))}
              <Pager label={zh ? "1-7 / 8 个论坛" : "1-7 of 8 Forums"} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
