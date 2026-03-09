import { ReactNode } from "react";
import AuthButton from "@/components/AuthButton";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Menu, X, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { name: "アイテム", href: "/items", icon: Package },
  { name: "活動日", href: "/activity", icon: CalendarIcon },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // ダークモード廃止

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー右上に認証ボタン */}
      <div className="w-full flex justify-end items-center px-6 py-2 bg-white border-b sticky top-0 z-40">
        <AuthButton />
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
            <h1 className="font-bold text-lg">メニュー</h1>
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
            <h1 className="font-bold text-lg">WS2C Explorer</h1>
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

      {/* Desktop sidebar removed: all navigation is now via the right-side drawer for all screen sizes */}

      {/* Main content */}
      <div className="w-full">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex-1 flex items-center">
              <a href="/" className="text-2xl font-extrabold text-black hover:underline transition-colors w-4/5 truncate">
                WS2C Exproler
              </a>
            </div>
            <div className="flex items-center gap-2">
              {/* ダークモード切替ボタン削除 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="ml-2"
              >
                <Menu className="w-7 h-7" />
              </Button>
            </div>
          </div>
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
