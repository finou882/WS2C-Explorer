import { ReactNode } from "react";
import AuthButton from "@/components/AuthButton";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/useThemeMode";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Menu, X, Calendar as CalendarIcon, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { name: "アイテム", href: "/items", icon: Package },
  { name: "活動日", href: "/activity", icon: CalendarIcon },
  { name: "設定", href: "/settings", icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // ダークモード廃止

  const [dark, setDark] = useThemeMode();
  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー右上に認証・ダークモード切替ボタン */}
      <div className="w-full flex items-center justify-between px-6 py-2 bg-background border-b sticky top-0 z-40 gap-4">
        {/* トップバー一本化: ロゴ/タイトル/メニュー/認証/ダーク切替 */}
        <div className="flex items-center gap-6">
          <a href="/" className="font-bold text-2xl text-foreground hover:underline transition-colors select-none">WS2C Explorer</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((v) => !v)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <button
            aria-label="ダークモード切替"
            className="rounded-full p-2 hover:bg-muted transition-colors border border-primary"
            style={{ background: dark ? '#222' : '#fff', color: dark ? '#fff' : '#222' }}
            onClick={() => setDark((v: boolean) => !v)}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <AuthButton />
        </div>
      </div>
      {/* Right-side drawer sidebar for all screen sizes */}
      <div
        className={`fixed inset-0 z-50 ${sidebarOpen ? "block" : "hidden"}`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 right-0 w-64 bg-background border-l shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="font-bold text-lg text-foreground">メニュー</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="font-bold text-lg text-foreground">WS2C Explorer</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                <nav className="p-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                  <Link to="/eula" className={navClass("/eula")}>利用規約</Link>
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar removed: all navigation is now via the right-side drawer for all screen sizes */}

      {/* Main content */}
      <div className="w-full">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
            {/* Removed top bar for consolidation */}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 w-full">{children}</main>
      </div>
      {/* 右下バージョン表記 */}
      <div className="fixed bottom-2 right-4 z-50 text-xs text-muted-foreground select-none pointer-events-none">
        v1.1.0-alpha byFinou
      </div>
    </div>
  );
}
