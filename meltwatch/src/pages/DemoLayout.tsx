import { Outlet, NavLink, Link } from "react-router-dom";
import { Home, TrendingUp, Target, LineChart, Users, FileText, Bell, MessageSquare, User, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";
const TEAL_BG = "#E8F7F7";

const NAV = [
  { to: "/demo",              icon: Home,       en: "Home",              zh: "首页",      end: true },
  { to: "/demo/explore",      icon: TrendingUp, en: "Explore",           zh: "探索" },
  { to: "/demo/monitor",      icon: Bell,       en: "Monitor",           zh: "监测" },
  { to: "/demo/analytics",    icon: LineChart,      en: "Consumer",    zh: "消费者洞察" },
  { to: "/demo/competitive",  icon: Target,         en: "Strategy",    zh: "策略分析" },
  { to: "/demo/influencer",   icon: Users,          en: "Influencer",  zh: "网红" },
  { to: "/demo/report",       icon: FileText,       en: "Report",      zh: "报告" },
  { to: "/demo/alerts",       icon: MessageSquare,  en: "Message",     zh: "消息" },
];

export function DemoLayout() {
  const { language, setLanguage } = useLanguage();
  const zh = language === "zh";

  return (
    <div className="flex h-screen bg-[#F5F6F7] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 text-gray-900 hover:opacity-75 transition-opacity">
            <ArrowLeft size={13} className="text-gray-400" />
            <span className="font-display font-bold text-base tracking-tight">Meltwatch</span>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "font-semibold"
                    : "font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: TEAL_BG, color: TEAL }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={15} style={isActive ? { color: TEAL } : {}} />
                  {zh ? item.zh : item.en}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100">
          <div className="px-3 py-2">
            <NavLink
              to="/demo/account"
              className={({ isActive }) =>
                `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "font-semibold"
                    : "font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: TEAL_BG, color: TEAL } : {}
              }
            >
              {({ isActive }) => (
                <>
                  <User size={15} style={isActive ? { color: TEAL } : {}} />
                  {zh ? "账户" : "Account"}
                </>
              )}
            </NavLink>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-0.5 rounded-full border border-gray-200 p-0.5 text-xs font-mono w-fit">
              <button onClick={() => setLanguage("en")} className={`px-2.5 py-1 rounded-full transition-all ${language === "en" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>EN</button>
              <button onClick={() => setLanguage("zh")} className={`px-2.5 py-1 rounded-full transition-all ${language === "zh" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>中文</button>
            </div>
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
