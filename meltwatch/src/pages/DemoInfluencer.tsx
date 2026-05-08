import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

export function DemoInfluencer() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const creators = [
    { name: "Maëlle Kestrel", handle: "@maelle.kestrel", followers: "284K", auth: 96, bots: 2,  status: "verified", color: TEAL     },
    { name: "Axel Park",      handle: "@axelparkrun",    followers: "1.2M", auth: 41, bots: 38, status: "flagged",  color: "#6B7280" },
    { name: "Nora Whitlock",  handle: "@nora.codes",     followers: "92K",  auth: 88, bots: 6,  status: "verified", color: "#16A34A" },
    { name: "Lin Yuchen",     handle: "@lin.yuchen",     followers: "560K", auth: 79, bots: 8,  status: "verified", color: "#7C3AED" },
  ];

  const stats = [
    { en: "Total Creators",    zh: "创作者总数",  val: "247"  },
    { en: "Avg. Authenticity", zh: "平均真实性",  val: "82%"  },
    { en: "Flagged Accounts",  zh: "风险账号",    val: "23"   },
    { en: "Active Campaigns",  zh: "进行中活动",  val: "4"    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.en} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{zh ? s.zh : s.en}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">{zh ? "创作者真实性评分 · 实时" : "Creator Authenticity · Live"}</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400">3 of 247</span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {creators.map((c) => (
            <div key={c.handle} className="px-6 py-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: c.color }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.status === "verified" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                      {c.status === "verified" ? (zh ? "已验证" : "VERIFIED") : (zh ? "待核查" : "FLAGGED")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{c.handle} · {c.followers} {zh ? "粉丝" : "followers"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: zh?"真实性":"Authenticity", val: c.auth,  color: c.auth  > 70 ? "#16A34A" : "#F59E0B" },
                  { label: zh?"机器人占比":"Bot %",    val: c.bots, color: c.bots > 20 ? "#DC2626" : "#9CA3AF" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500 uppercase tracking-wider">{m.label}</span>
                      <span className="font-semibold text-gray-700">{m.val}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
