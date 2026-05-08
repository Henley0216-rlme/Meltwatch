import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];
const IC = "#3BBFB7"; // teal for all icons
const CAT_MS = 3800;

const WORDS: Record<string, string[]> = {
  en: ["competitors", "brand", "audience", "market", "industry"],
  zh: ["竞争对手", "品牌", "受众", "市场", "行业"],
};

export function Hero() {
  const { t, language } = useLanguage();
  const words = WORDS[language];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    setWordIdx(0);
    const id = setInterval(() => setWordIdx((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(id);
  }, [language, words.length]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: easeOut } },
  };

  return (
    <section className="relative pt-32 lg:pt-40 pb-24 lg:pb-32 overflow-hidden grain">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0E0E0C 1px, transparent 1px), linear-gradient(to bottom, #0E0E0C 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-molten/10 blur-3xl pointer-events-none" />

      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <motion.div variants={container} initial="hidden" animate="show" className="lg:col-span-6">
            <motion.div variants={item} className="flex items-center gap-3 mb-8">
              <span className="h-px w-10 bg-molten" />
              <span className="label">{t.hero.eyebrow}</span>
            </motion.div>

            <motion.h1
              variants={item}
              className="font-display font-semibold text-[86px] text-ink mb-8 tracking-tight leading-[1.1]"
            >
              {language === "zh" ? (
                <>
                  深入洞察你的
                  <br />
                  <span className="inline-flex items-baseline h-[1.1em] overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIdx}
                        className="inline-block text-molten absolute"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{ duration: 0.45, ease: easeOut }}
                      >
                        {words[wordIdx]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="invisible" aria-hidden>
                      {words.reduce((a, b) => (a.length >= b.length ? a : b))}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  Gain deeper
                  <br />
                  visibility into your
                  <br />
                  <span className="inline-flex items-baseline h-[1.1em] overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIdx}
                        className="inline-block text-molten absolute"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{ duration: 0.45, ease: easeOut }}
                      >
                        {words[wordIdx]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="invisible" aria-hidden>
                      {words.reduce((a, b) => (a.length >= b.length ? a : b))}
                    </span>
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={item}
              className={`max-w-xl text-lg text-ink-600 mb-10 ${language === "zh" ? "leading-[1.85]" : "leading-relaxed"}`}
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4 items-center">
              <Button variant="molten" size="lg" className="group">
                {t.hero.cta}
                <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
              </Button>
              <a href="#" className="text-sm text-ink-600 hover:text-ink transition-colors underline-offset-4 hover:underline">
                {t.nav.signIn}
              </a>
            </motion.div>

            <motion.p variants={item} className="mt-6 text-xs text-ink-500 font-mono">
              {t.hero.caption}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.4, ease: easeOut }}
            className="lg:col-span-6 relative"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Platform icons (PNG images) ──────────────────────────────────────────────

const Ico = (src: string) => () => (
  <img src={src} alt="" className="w-3/5 h-3/5 object-contain" draggable={false} />
);

const XIco        = Ico("/icons/x.png");
const FbIco       = Ico("/icons/facebook.png");
const XhsIco      = Ico("/icons/xiaohongshu.png");
const DouyinIco   = Ico("/icons/douyin.png");
const WechatIco   = Ico("/icons/weixin.png");
const WeiboIco    = Ico("/icons/weibo.png");
const YouTubeIco  = Ico("/icons/yotube.png");
const BilibiliIco = Ico("/icons/bilibili.png");
const TaobaoIco   = Ico("/icons/taobao.png");
const DewuIco     = Ico("/icons/dewu.png");
const ClaudeIco   = Ico("/icons/claude.png");
const DeepseekIco = Ico("/icons/deepseek.png");
const DoubaoIco   = Ico("/icons/doubao.png");
const GeminiIco   = Ico("/icons/gemini.png");
const YuanbaoIco  = Ico("/icons/yuanbao.png");
const ChatgptIco  = Ico("/icons/chatgpt.png");
const GoogleIco   = Ico("/icons/google.png");

// ─── Category data ────────────────────────────────────────────────────────────

type IconEntry = { Icon: () => React.ReactElement; size: number };

// Compute evenly-spaced positions on a circle centered at (cx, cy)
function ringPos(n: number, radiusPct: number, cx = 47, cy = 47, startDeg = -90) {
  return Array.from({ length: n }, (_, i) => {
    const rad = ((startDeg + (i * 360) / n) * Math.PI) / 180;
    return { x: cx + radiusPct * Math.cos(rad), y: cy + radiusPct * Math.sin(rad) };
  });
}

const ICON_SETS: IconEntry[][] = [
  // Social Media
  [
    { Icon: XIco,        size: 44 },
    { Icon: FbIco,       size: 44 },
    { Icon: XhsIco,      size: 44 },
    { Icon: DouyinIco,   size: 44 },
    { Icon: WechatIco,   size: 44 },
    { Icon: WeiboIco,    size: 44 },
    { Icon: YouTubeIco,  size: 44 },
    { Icon: BilibiliIco, size: 44 },
  ],
  // Online Shopping
  [
    { Icon: TaobaoIco,   size: 44 },
    { Icon: DouyinIco,   size: 44 },
    { Icon: XhsIco,      size: 44 },
    { Icon: DewuIco,     size: 44 },
    { Icon: BilibiliIco, size: 44 },
  ],
  // AI Data
  [
    { Icon: ClaudeIco,   size: 44 },
    { Icon: DeepseekIco, size: 44 },
    { Icon: DoubaoIco,   size: 44 },
    { Icon: ChatgptIco,  size: 44 },
    { Icon: GeminiIco,   size: 44 },
    { Icon: YuanbaoIco,  size: 44 },
    { Icon: GoogleIco,   size: 44 },
  ],
];

const CATS = [
  { line1: "Social", line2: "Media" },
  { line1: "Online", line2: "Shopping" },
  { line1: "AI Data", line2: null },
];

// Right-side bubble positions as % of container
const CAT_POS = [
  { x: 77, y: 16 },
  { x: 84, y: 50 },
  { x: 77, y: 84 },
];

// ─── HeroVisual ───────────────────────────────────────────────────────────────

function HeroVisual() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), CAT_MS);
    return () => clearInterval(id);
  }, []);

  const icons = ICON_SETS[active];
  const positions = ringPos(icons.length, 28);

  return (
    <div className="relative w-full aspect-square max-w-[920px] mx-auto select-none">
      {/* Background: PNG glow image (transparent background preserved) */}
      <img
        src="/hero-glow.png"
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      />

      {/* Platform icons — arranged on a ring centered on the image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {icons.map((entry, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full bg-white flex items-center justify-center"
              style={{
                width: entry.size,
                height: entry.size,
                left: `${positions[idx].x}%`,
                top: `${positions[idx].y}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.38, delay: idx * 0.06, ease: easeOut }}
            >
              <entry.Icon />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Category label bubbles (right side, clickable) */}
      {CATS.map((cat, i) => {
        const on = active === i;
        const circ = 2 * Math.PI * 46;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
            style={{
              width: 96, height: 96,
              left: `${CAT_POS[i].x}%`,
              top: `${CAT_POS[i].y}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: on ? "0 4px 20px rgba(59,191,183,0.22)" : "0 2px 14px rgba(0,0,0,0.08)",
              zIndex: 10,
            }}
            animate={{ scale: on ? 1.07 : 1 }}
            transition={{ duration: 0.35 }}
            onClick={() => setActive(i)}
          >
            {/* Progress ring (SVG arc fills over CAT_MS) */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
              <motion.circle
                key={`${i}-${on ? "on" : "off"}`}
                cx="50" cy="50" r="46"
                fill="none"
                stroke={IC}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: on ? 0 : circ }}
                transition={{ duration: on ? CAT_MS / 1000 : 0.15, ease: "linear" }}
              />
            </svg>
            {/* Text */}
            <span
              className="relative z-10 font-bold text-[13px] leading-tight"
              style={{ color: on ? IC : "#374151" }}
            >
              {cat.line1}
            </span>
            {cat.line2 && (
              <span
                className="relative z-10 font-bold text-[13px] leading-tight"
                style={{ color: on ? IC : "#374151" }}
              >
                {cat.line2}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
