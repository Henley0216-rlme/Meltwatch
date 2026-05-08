import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type SubItem = { label: string; href: string };
type ColumnItem = { label: string; description?: string; href: string };
type ColumnSection = { heading: string; items: ColumnItem[] };
type FeaturedCard = { title: string; description: string; linkLabel: string; href: string };

type ProductFeatured = {
  title: string;
  description: string;
  linkLabel: string;
  href: string;
  icon?: boolean;
};
type ProductCapability = {
  label: string;
  description: string;
  href: string;
  dividerAfter?: boolean;
};
type ProductPanel = {
  featured: ProductFeatured[];
  simpleLinks: SubItem[];
  capabilities: { heading: string; items: ProductCapability[] };
  card: FeaturedCard;
};

type NavItem = {
  key: string;
  label: string;
  href?: string;
  items?: SubItem[];
  featured?: FeaturedCard[];
  columns?: ColumnSection[];
  card?: FeaturedCard;
  productPanel?: ProductPanel;
};

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const zh = language === "zh";

  const navItems: NavItem[] = [
    {
      key: "suite",
      label: t.nav.products,
      productPanel: {
        featured: [
          {
            title: zh ? "Meltwatch 平台" : "The Meltwatch Platform",
            description: zh
              ? "AI 驱动的情报，将媒体与社交数据转化为可操作的品牌洞察。"
              : "AI-powered intelligence that turns media and social data into actionable insights.",
            linkLabel: zh ? "查看平台" : "View the platform",
            href: "#",
          },
          {
            title: zh ? "AI 分析引擎" : "AI Analysis Engine",
            description: zh
              ? "即时从品牌媒体曝光中提取 AI 驱动的深度洞察。"
              : "Instant AI-driven insights extracted from your brand's media presence.",
            linkLabel: zh ? "探索 AI 分析" : "Explore AI Analysis",
            href: "#",
            icon: true,
          },
        ],
        simpleLinks: [
          { label: zh ? "全球内容覆盖" : "Global Content Coverage", href: "#" },
          { label: zh ? "分析与报告" : "Measurement & Analytics", href: "#" },
          { label: "Integrations & API", href: "#" },
        ],
        capabilities: {
          heading: zh ? "核心能力" : "CAPABILITIES",
          items: [
            {
              label: zh ? "危机管理" : "Crisis Management",
              description: zh ? "实时监控品牌威胁并快速响应" : "Monitor brand threats and respond in real time",
              href: "#service-crisis",
            },
            {
              label: zh ? "竞品情报" : "Competitive Intelligence",
              description: zh ? "跨渠道追踪竞争对手动态与基准" : "Track rivals across channels and markets",
              href: "#service-competitive",
              dividerAfter: true,
            },
            {
              label: zh ? "消费者洞察" : "Consumer Insights",
              description: zh ? "洞察趋势与受众情绪变化" : "Understand trends and audience sentiment",
              href: "#service-consumer",
            },
            {
              label: zh ? "网红营销" : "Influencer Marketing",
              description: zh ? "识别并触达关键意见领袖" : "Identify and engage key influencers",
              href: "#service-influencer",
            },
          ],
        },
        card: {
          title: zh ? "2026 年中产品发布" : "Mid-Year 2026 Product Release",
          description: zh
            ? "用 AI 情报主动塑造品牌叙事，让您的品牌在任何地方都按您的意愿呈现。"
            : "Proactively shape your brand narrative with AI-powered intelligence. Your brand shows up the way you intend, everywhere it matters.",
          linkLabel: zh ? "了解新功能" : "Learn What's New",
          href: "#",
        },
      },
    },
    {
      key: "solutions",
      label: t.nav.solutions,
      href: "#capabilities",
      columns: [
        {
          heading: zh ? "产品" : "PRODUCTS",
          items: [
            { label: zh ? "危机管理" : "Crisis Management", href: "#service-crisis" },
            { label: zh ? "竞品情报" : "Competitive Intelligence", href: "#service-competitive" },
            { label: zh ? "消费者洞察" : "Consumer Insights", href: "#service-consumer" },
            { label: zh ? "网红营销" : "Influencer Marketing", href: "#service-influencer" },
          ],
        },
        {
          heading: zh ? "按使用场景" : "BY USE CASE",
          items: [
            { label: zh ? "危机管理与实时告警" : "Crisis Management & Real-Time Alerts", href: "#service-crisis" },
            { label: zh ? "竞品情报与基准对比" : "Competitive Intelligence & Benchmarking", href: "#service-competitive" },
            { label: zh ? "消费者洞察与趋势检测" : "Consumer Insights & Trend Detection", href: "#service-consumer" },
            { label: zh ? "网红管理与营销 ROI" : "Influencer Management & Campaign ROI", href: "#service-influencer" },
          ],
        },
        {
          heading: zh ? "按组织类型" : "BY ORGANIZATION TYPE",
          items: [
            { label: zh ? "企业" : "Enterprise", description: zh ? "大规模全球情报" : "Global intelligence at scale", href: "#" },
            { label: zh ? "中小企业" : "Small & Medium Business", description: zh ? "强大洞察,简单上手" : "Powerful insights, simplified", href: "#" },
            { label: zh ? "代理商" : "Agency", description: zh ? "为客户创造可量化的影响" : "Deliver measurable client impact", href: "#" },
            { label: zh ? "内容创作者" : "Creators", description: zh ? "用更智能的数据提升影响力" : "Grow influence with smarter data", href: "#" },
          ],
        },
      ],
      card: {
        title: zh ? "驱动可量化的营销 ROI" : "Driving measurable campaign ROI",
        description: zh ? "了解一家全球品牌如何将网红营销绩效提升了 35%。" : "See how a global brand increased influencer performance by 35%.",
        linkLabel: zh ? "阅读案例" : "Read the story",
        href: "#",
      },
    },
    {
      key: "resources",
      label: t.nav.resources,
      featured: [
        {
          title: zh ? "智识中心" : "Intelligence Hub",
          description: zh ? "由 Meltwater 情报驱动的数据故事" : "Data stories powered by Meltwater intelligence",
          linkLabel: zh ? "探索智识中心" : "Explore Intelligence Hub",
          href: "#",
        },
        {
          title: zh ? "客户社区" : "Customer Community",
          description: zh ? "与同行、专家和最佳实践建立连接" : "Connect with peers, experts, and best practices.",
          linkLabel: zh ? "探索社区" : "Explore community",
          href: "#",
        },
      ],
      items: [
        { label: zh ? "博客" : "Blog", href: "#" },
        { label: zh ? "报告与指南" : "Reports & Guides", href: "#" },
        { label: zh ? "活动" : "Events", href: "#" },
        { label: zh ? "产品更新" : "Product Updates", href: "#" },
        { label: zh ? "学院" : "Academy", href: "#" },
      ],
    },
    { key: "customers", label: zh ? "客户" : "Customers", href: "#" },
    { key: "about", label: zh ? "关于" : "About", href: "#" },
  ];

  function openDropdown(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(key);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-cream",
        scrolled ? "border-b border-ink/[0.08] shadow-[0_1px_0_0_rgba(14,14,12,0.04)]" : ""
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-8">
        {/* Logo */}
        <a href="#" className="flex items-baseline gap-2 flex-shrink-0">
          <span className="font-display text-2xl font-bold tracking-tight">Meltwatch</span>
          <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-molten" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {navItems.map((item) =>
            (item.items || item.columns || item.featured || item.productPanel) ? (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => openDropdown(item.key)}
                onMouseLeave={scheduleClose}
              >
                <a
                  href={item.href ?? "#"}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-ink-600 hover:text-ink transition-colors rounded-lg hover:bg-ink/[0.04]"
                >
                  {item.label}
                  <ChevronDown
                    size={13}
                    className={cn(
                      "transition-transform duration-200 text-ink-400",
                      activeDropdown === item.key ? "rotate-180" : ""
                    )}
                  />
                </a>

                <AnimatePresence>
                  {activeDropdown === item.key && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "absolute top-full mt-1.5 bg-cream border border-ink/10 rounded-xl shadow-xl shadow-ink/[0.06] overflow-hidden",
                        item.productPanel ? "left-0 w-[900px]"
                          : item.columns ? "left-0 w-[960px]"
                          : item.featured ? "left-0 w-[580px]"
                          : "left-0 w-52"
                      )}
                      onMouseEnter={() => openDropdown(item.key)}
                      onMouseLeave={scheduleClose}
                    >
                      {item.productPanel ? (
                        <div className="flex p-6 gap-0">
                          {/* Left: featured + simple links */}
                          <div className="w-64 flex-shrink-0 flex flex-col pr-6">
                            {item.productPanel.featured.map((feat, i) => (
                              <div key={feat.title}>
                                {i > 0 && <hr className="my-4 border-ink/[0.1]" />}
                                <div className="flex items-start gap-3">
                                  {feat.icon && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-molten/30 to-ink/20 flex items-center justify-center mt-0.5">
                                      <span className="text-[11px] font-bold text-molten">✦</span>
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-display text-base font-bold text-ink leading-snug">
                                      {feat.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-ink-400 leading-relaxed">
                                      {feat.description}
                                    </p>
                                    <a
                                      href={feat.href}
                                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-molten hover:text-molten-700 transition-colors"
                                    >
                                      {feat.linkLabel} <span>→</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <hr className="my-4 border-ink/[0.1]" />
                            <div className="flex flex-col gap-0.5">
                              {item.productPanel.simpleLinks.map((link) => (
                                <a
                                  key={link.label}
                                  href={link.href}
                                  className="block px-2 py-1.5 text-sm font-semibold text-ink-600 hover:text-ink hover:bg-ink/[0.05] rounded-lg transition-colors"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Middle: capabilities */}
                          <div className="flex-1 border-l border-r border-ink/[0.08] px-6">
                            <p className="mb-4 text-[11px] font-semibold tracking-widest text-ink-400 uppercase">
                              {item.productPanel.capabilities.heading}
                            </p>
                            <div className="flex flex-col">
                              {item.productPanel.capabilities.items.map((cap) => (
                                <div key={cap.label}>
                                  <a
                                    href={cap.href}
                                    className="group block py-2.5 px-2 -mx-2 hover:bg-ink/[0.04] rounded-lg transition-colors"
                                  >
                                    <span className="block text-sm font-bold text-ink leading-snug">
                                      {cap.label}
                                    </span>
                                    <span className="block text-xs text-ink-400 mt-0.5">
                                      {cap.description}
                                    </span>
                                  </a>
                                  {cap.dividerAfter && <hr className="my-1.5 border-ink/[0.08]" />}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: card */}
                          <div className="w-52 flex-shrink-0 pl-6">
                            <div className="rounded-xl border border-ink/10 overflow-hidden bg-cream-50 h-full flex flex-col">
                              <div className="h-32 bg-gradient-to-br from-molten/20 to-ink/10 flex items-center justify-center">
                                <span className="font-mono text-[10px] text-ink-400 uppercase tracking-widest">
                                  Product Update
                                </span>
                              </div>
                              <div className="p-4 flex flex-col gap-2 flex-1">
                                <p className="text-sm font-bold text-ink leading-snug">
                                  {item.productPanel.card.title}
                                </p>
                                <p className="text-xs text-ink-400 leading-relaxed flex-1">
                                  {item.productPanel.card.description}
                                </p>
                                <a
                                  href={item.productPanel.card.href}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-molten hover:text-molten-700 transition-colors"
                                >
                                  {item.productPanel.card.linkLabel} <span>→</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : item.columns ? (
                        <div className="flex p-6 gap-8">
                          {/* Column sections */}
                          {item.columns.map((col, ci) => (
                            <div key={ci} className="flex-1">
                              <p className="mb-4 text-[11px] font-semibold tracking-widest text-ink-400 uppercase">
                                {col.heading}
                              </p>
                              <div className="flex flex-col gap-1">
                                {col.items.map((colItem) => (
                                  <a
                                    key={colItem.label}
                                    href={colItem.href}
                                    className="group block rounded-lg px-2 py-2 hover:bg-ink/[0.05] transition-colors"
                                  >
                                    <span className="block text-sm font-semibold text-ink group-hover:text-ink leading-snug">
                                      {colItem.label}
                                    </span>
                                    {colItem.description && (
                                      <span className="block text-xs text-ink-400 mt-0.5 leading-snug">
                                        {colItem.description}
                                      </span>
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                          {/* Featured card */}
                          {item.card && (
                            <div className="w-52 flex-shrink-0">
                              <div className="rounded-xl border border-ink/10 overflow-hidden bg-cream-50 h-full flex flex-col">
                                <div className="h-28 bg-gradient-to-br from-molten/20 to-ink/10 flex items-center justify-center">
                                  <span className="font-mono text-[10px] text-ink-400 uppercase tracking-widest">Case Study</span>
                                </div>
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                  <p className="text-sm font-bold text-ink leading-snug">{item.card.title}</p>
                                  <p className="text-xs text-ink-400 leading-relaxed flex-1">{item.card.description}</p>
                                  <a
                                    href={item.card.href}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-molten hover:text-molten-700 transition-colors"
                                  >
                                    {item.card.linkLabel} <span>→</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : item.featured ? (
                        <div className="flex">
                          {/* Left: featured sections */}
                          <div className="flex-1 p-6 border-r border-ink/[0.08]">
                            {item.featured.map((feat, i) => (
                              <div key={feat.title}>
                                {i > 0 && <hr className="my-5 border-ink/[0.1]" />}
                                <h3 className="font-display text-lg font-bold text-ink leading-snug">
                                  {feat.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-ink-400 leading-relaxed">
                                  {feat.description}
                                </p>
                                <a
                                  href={feat.href}
                                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-molten hover:text-molten-700 transition-colors"
                                >
                                  {feat.linkLabel}
                                  <span>→</span>
                                </a>
                              </div>
                            ))}
                          </div>
                          {/* Right: simple links */}
                          <div className="w-48 p-4 flex flex-col justify-start gap-0.5">
                            {item.items?.map((sub) => (
                              <a
                                key={sub.label}
                                href={sub.href}
                                className="block px-2 py-2.5 text-sm text-ink-600 hover:text-ink hover:bg-ink/[0.05] rounded-lg transition-colors"
                              >
                                {sub.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-1.5">
                          {item.items?.map((sub) => (
                            <a
                              key={sub.label}
                              href={sub.href}
                              className="block px-3 py-2 text-sm text-ink-600 hover:text-ink hover:bg-ink/[0.05] rounded-lg transition-colors"
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                key={item.key}
                href={item.href}
                className="px-3 py-2 text-sm font-bold text-ink-600 hover:text-ink transition-colors rounded-lg hover:bg-ink/[0.04]"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-ink/15 p-0.5 text-xs font-mono mr-1">
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "px-2.5 py-1 rounded-full transition-all",
                language === "en" ? "bg-ink text-cream" : "text-ink-500 hover:text-ink"
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("zh")}
              className={cn(
                "px-2.5 py-1 rounded-full transition-all",
                language === "zh" ? "bg-ink text-cream" : "text-ink-500 hover:text-ink"
              )}
            >
              中文
            </button>
          </div>

          <a
            href="#"
            className="hidden md:block px-3 py-2 text-sm font-bold text-ink-600 hover:text-ink transition-colors"
          >
            {t.nav.signIn}
          </a>
          <a
            href="#"
            className="hidden md:block px-3 py-2 text-sm font-bold text-ink-600 hover:text-ink transition-colors"
          >
            {t.nav.pricing}
          </a>

          <Link to="/demo">
            <Button variant="default" size="sm" className="hidden md:inline-flex ml-1">
              {t.nav.getDemo}
            </Button>
          </Link>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-ink/[0.05] transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            className="lg:hidden bg-cream border-t border-ink/[0.06] overflow-hidden"
          >
            <div className="container py-5 flex flex-col gap-1">
              {navItems.map((item) =>
                (item.items || item.columns || item.featured || item.productPanel) ? (
                  <div key={item.key}>
                    <p className="px-2 py-2 text-sm font-medium text-ink">{item.label}</p>
                    <div className="pl-3 flex flex-col">
                      {item.productPanel
                        ? [
                            ...item.productPanel.featured.map((f) => ({ label: f.title, href: f.href })),
                            ...item.productPanel.simpleLinks,
                            ...item.productPanel.capabilities.items,
                          ].map((sub) => (
                            <a
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className="px-2 py-2 text-sm text-ink-500 hover:text-ink transition-colors"
                            >
                              {sub.label}
                            </a>
                          ))
                        : item.columns
                        ? item.columns.flatMap((col) => col.items).map((sub) => (
                            <a
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className="px-2 py-2 text-sm text-ink-500 hover:text-ink transition-colors"
                            >
                              {sub.label}
                            </a>
                          ))
                        : (item.items ?? []).map((sub) => (
                            <a
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className="px-2 py-2 text-sm text-ink-500 hover:text-ink transition-colors"
                            >
                              {sub.label}
                            </a>
                          ))}
                    </div>
                  </div>
                ) : (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-2 py-2 text-sm text-ink-700 hover:text-ink transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}

              <div className="flex items-center gap-2 pt-4 mt-2 border-t border-ink/[0.06]">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-mono border",
                    language === "en"
                      ? "bg-ink text-cream border-ink"
                      : "text-ink-500 border-ink/20"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("zh")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-mono border",
                    language === "zh"
                      ? "bg-ink text-cream border-ink"
                      : "text-ink-500 border-ink/20"
                  )}
                >
                  中文
                </button>
              </div>
              <Link to="/demo" onClick={() => setMobileOpen(false)}>
                <Button variant="default" size="sm" className="self-start mt-2">
                  {t.nav.getDemo}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
