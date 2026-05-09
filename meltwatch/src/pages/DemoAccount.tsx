import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { login, register, logout, getCurrentUser, updateApiKey, type User } from "@/lib/api";

const TEAL = "#2BB7B8";

export function DemoAccount() {
  const { language } = useLanguage();
  const zh = language === "zh";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // API Key form state
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [apiKeyMsg, setApiKeyMsg] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const result = await getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
        setApiKey(result.data.zhipu_api_key || "");
      }
    } catch (e) {
      console.error("Check user failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password, username);

      if (result.success && result.data) {
        // Save API key if provided (for new users or updates)
        if (apiKey.trim()) {
          await updateApiKey(apiKey.trim());
        }
        await checkUser();
        setEmail("");
        setPassword("");
        setUsername("");
        if (!apiKey.trim()) {
          setApiKey("");
        }
      } else {
        setError(result.error || (zh ? "操作失败" : "Operation failed"));
      }
    } catch (e) {
      setError(zh ? "网络错误" : "Network error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setApiKey("");
  };

  const handleSaveApiKey = async () => {
    setApiKeyMsg(null);
    setApiKeySaving(true);

    try {
      const result = await updateApiKey(apiKey);
      if (result.success) {
        setApiKeyMsg(zh ? "API Key 已保存" : "API Key saved");
        setTimeout(() => setApiKeyMsg(null), 3000);
      } else {
        setApiKeyMsg(result.error || (zh ? "保存失败" : "Save failed"));
      }
    } catch {
      setApiKeyMsg(zh ? "网络错误" : "Network error");
    } finally {
      setApiKeySaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">{zh ? "加载中..." : "Loading..."}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-5">
            <h2 className="font-semibold text-gray-900">{zh ? "登录账户" : "Sign In"}</h2>
            <p className="text-xs text-gray-400">
              {zh ? "填写 API Key 后可使用自己的智谱配额进行 AI 对话" : "Enter your API Key to use your own Zhipu quota for AI chat"}
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
            <div className="flex mb-6 border-b border-gray-100">
              <button
                onClick={() => setIsLogin(true)}
                className={`pb-3 text-sm font-medium transition-colors ${
                  isLogin ? "text-gray-800 border-b-2" : "text-gray-400"
                }`}
                style={{ borderColor: isLogin ? TEAL : "transparent" }}
              >
                {zh ? "登录" : "Sign In"}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`pb-3 text-sm font-medium transition-colors ml-6 ${
                  !isLogin ? "text-gray-800 border-b-2" : "text-gray-400"
                }`}
                style={{ borderColor: !isLogin ? TEAL : "transparent" }}
              >
                {zh ? "注册" : "Register"}
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {zh ? "用户名" : "Username"}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2BB7B8]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {zh ? "邮箱" : "Email"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2BB7B8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {zh ? "密码" : "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2BB7B8]"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {zh ? "智谱 API Key（可选）" : "Zhipu API Key (Optional)"}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={zh ? "输入您的智谱 API Key..." : "Enter your Zhipu API Key..."}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2BB7B8]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {zh ? "不填则使用系统默认 API" : "Leave empty to use system API"}
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2 text-sm font-medium text-white rounded-lg transition-opacity disabled:opacity-50"
                style={{ backgroundColor: TEAL }}
              >
                {authLoading ? (zh ? "处理中..." : "Processing...") : (isLogin ? (zh ? "登录" : "Sign In") : (zh ? "注册" : "Register"))}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{zh ? "账户设置" : "Account Settings"}</h2>
            <p className="text-xs text-gray-400">{zh ? "管理您的账户信息" : "Manage your account"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            {zh ? "退出登录" : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">{zh ? "个人资料" : "Profile"}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center px-6 py-3">
            <span className="text-sm text-gray-500 w-24">{zh ? "用户名" : "Name"}</span>
            <span className="text-sm font-medium text-gray-800">{user.username}</span>
          </div>
          <div className="flex items-center px-6 py-3">
            <span className="text-sm text-gray-500 w-24">{zh ? "邮箱" : "Email"}</span>
            <span className="text-sm font-medium text-gray-800">{user.email}</span>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">{zh ? "智谱 API Key" : "Zhipu API Key"}</h3>
          <p className="text-xs text-gray-400 mt-1">
            {zh ? "设置后将使用您自己的 API Key 进行 AI 对话" : "Your own API key will be used for AI chat"}
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">
              {zh ? "API Key" : "API Key"}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={zh ? "输入您的智谱 API Key..." : "Enter your Zhipu API Key..."}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2BB7B8]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveApiKey}
              disabled={apiKeySaving}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity disabled:opacity-50"
              style={{ backgroundColor: TEAL }}
            >
              {apiKeySaving ? (zh ? "保存中..." : "Saving...") : (zh ? "保存" : "Save")}
            </button>
            {apiKeyMsg && (
              <span className={`text-xs ${apiKeyMsg.includes("失败") || apiKeyMsg.includes("failed") ? "text-red-500" : "text-green-500"}`}>
                {apiKeyMsg}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {zh ? "获取 API Key: " : "Get API Key: "}
            <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-[#2BB7B8] hover:underline">
              https://open.bigmodel.cn/
            </a>
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 px-6 py-4">
        <h4 className="text-sm font-medium text-blue-700 mb-2">
          {zh ? "关于 API Key" : "About API Key"}
        </h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• {zh ? "使用自己的 API Key 可以享受您账户的配额" : "Use your own API key to enjoy your account's quota"}</li>
          <li>• {zh ? "不设置则使用系统默认 Key，功能相同" : "If not set, system default key is used"}</li>
          <li>• {zh ? "您的 Key 仅存储在本地，不会上传到服务器" : "Your key is stored locally only, not uploaded"}</li>
        </ul>
      </div>
    </div>
  );
}
