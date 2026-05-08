import { Outlet, NavLink, Link } from "react-router-dom";
import { Home, BarChart2, Bell, TrendingUp, Users, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

const NAV = [
  { to: "/demo",            icon: Home,       en: "Home",       zh: "首页",  end: true },
  { to: "/demo/explore",    icon: TrendingUp, en: "Explore",    zh: "探索" },
  { to: "/demo/monitor",    icon: Bell,       en: "Monitor",    zh: "监测" },
  { to: "/demo/analytics",  icon: BarChart2,  en: "Analytics",  zh: "分析" },
  { to: "/demo/influencer", icon: Users,      en: "Influencer", zh: "网红" },
];

export function DemoLayout() {
  const { language, setLanguage } = useLanguage();
  const zh = language === "zh";

  return (
    <div className="flex h-screen bg-[#F5F6F7] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 text-ink hover:opacity-80 transition-opacity">
            <ArrowLeft size={14} className="text-gray-400" />
            <span className="font-display font-bold text-lg tracking-tight">Meltwatch</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: TEAL } : {}}
            >
              <item.icon size={16} />
              {zh ? item.zh : item.en}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-0.5 rounded-full border border-gray-200 p-0.5 text-xs font-mono w-fit">
            <button onClick={() => setLanguage("en")} className={`px-2.5 py-1 rounded-full transition-all ${language === "en" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>EN</button>
            <button onClick={() => setLanguage("zh")} className={`px-2.5 py-1 rounded-full transition-all ${language === "zh" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>中文</button>
          </div>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
