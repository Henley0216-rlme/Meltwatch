import { useLanguage } from "@/contexts/LanguageContext";

const TEAL = "#2BB7B8";

export function DemoAccount() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const sections = [
    {
      title: { en: "Profile", zh: "个人资料" },
      items: [
        { label: { en: "Name", zh: "姓名" },          value: "Sarah Chen" },
        { label: { en: "Email", zh: "邮箱" },         value: "sarah@acme.com" },
        { label: { en: "Role", zh: "角色" },           value: zh ? "管理员" : "Admin" },
        { label: { en: "Organization", zh: "组织" },   value: "Acme Corp" },
      ],
    },
    {
      title: { en: "Plan", zh: "套餐" },
      items: [
        { label: { en: "Current Plan", zh: "当前套餐" }, value: "Pro" },
        { label: { en: "Seats", zh: "席位数" },          value: "5 / 10" },
        { label: { en: "Renewal Date", zh: "续费日期" },  value: "Jan 1, 2025" },
        { label: { en: "Data Sources", zh: "数据来源" },  value: "6" },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
        <h2 className="font-semibold text-gray-900">{zh ? "账户设置" : "Account Settings"}</h2>
        <p className="text-xs text-gray-400">{zh ? "管理您的账户信息与套餐" : "Manage your profile and subscription"}</p>
      </div>

      {sections.map((sec) => (
        <div key={sec.title.en} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">{zh ? sec.title.zh : sec.title.en}</h3>
            <button className="text-xs font-medium hover:opacity-75 transition-opacity" style={{ color: TEAL }}>
              {zh ? "编辑" : "Edit"}
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {sec.items.map((item) => (
              <div key={item.label.en} className="flex items-center px-6 py-3">
                <span className="text-sm text-gray-500 w-36">{zh ? item.label.zh : item.label.en}</span>
                <span className="text-sm font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-50">
          <h3 className="text-sm font-semibold text-red-600">{zh ? "危险操作" : "Danger Zone"}</h3>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{zh ? "注销账户" : "Delete Account"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{zh ? "此操作不可撤销，所有数据将被永久删除" : "This action is irreversible. All data will be permanently deleted."}</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
            {zh ? "注销" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
