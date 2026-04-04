import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, FolderOpen, AlertTriangle } from "lucide-react";
import { itemsApi } from "@/lib/api";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { fetchNextActivityDay } from "@/lib/recentActivityApi";
import { loadPortfolioItems } from "@/lib/portfolioStorage";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [teamSelect, setTeamSelect] = useState<string[]>([]);
  const [registeringTeam, setRegisteringTeam] = useState(false);
  const [teamDialogError, setTeamDialogError] = useState<string | null>(null);
  const teamOptions = [
    { value: 'experiment', label: '実験班' },
    { value: 'robot', label: 'ロボット班' },
    { value: 'bio', label: '生物班' },
    { value: 'space', label: '宇宙班' },
    { value: 'ai', label: 'AI班' },
  ];

  // ログインユーザーのemail取得（onAuthStateChangeも監視）
  useEffect(() => {
    const getAndSetUser = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      setUserEmail(email);
    };
    getAndSetUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);
    });
    return () => { listener?.subscription?.unsubscribe(); };
  }, []);

  // ログイン済みユーザーの初回アクセス時のみ班選択ダイアログを表示
  useEffect(() => {
    if (!userEmail) {
      setShowTeamDialog(false);
      setTeamSelect([]);
      return;
    }
    let ignore = false;
    (async () => {
      const { data: permData, error } = await supabase.from('users_permission').select('permission').eq('email', userEmail);
      const hasSeenDialog = localStorage.getItem(`team-dialog-seen:${userEmail}`) === "1";
      if (!ignore && !error && !hasSeenDialog && (!permData || permData.length === 0)) {
        setShowTeamDialog(true);
      }
    })();
    return () => { ignore = true; };
  }, [userEmail]);

  // 班登録ハンドラ
  const handleTeamRegister = async () => {
    if (!userEmail || teamSelect.length === 0) return;
    setRegisteringTeam(true);
    setTeamDialogError(null);
    const { error } = await supabase
      .from('users_permission')
      .upsert(
        {
          email: userEmail,
          permission: teamSelect.join(","),
        },
        { onConflict: "email" }
      );
    setRegisteringTeam(false);
    if (error) {
      setTeamDialogError(`登録に失敗しました: ${error.message}`);
      return;
    }
    localStorage.setItem(`team-dialog-seen:${userEmail}`, "1");
    setShowTeamDialog(false);
  };
  const toggleTeamSelection = (value: string) => {
    setTeamSelect((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  useEffect(() => {
    document.title = "ダッシュボード | WS2C Explorer";
  }, []);
  const { data: itemsData } = useQuery({
    queryKey: ["items"],
    queryFn: () => itemsApi.list(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => itemsApi.getCategories(),
  });

  const { data: recentPortfolioItems } = useQuery({
    queryKey: ["portfolio", "recent-dashboard"],
    queryFn: loadPortfolioItems,
    select: (items) => items.slice(0, 5),
  });

  const { data: nextActivityDay } = useQuery({
    queryKey: ["activity", "next-day"],
    queryFn: fetchNextActivityDay,
  });

  const items = itemsData?.items ?? [];
  const categories = categoriesData?.categories ?? [];

  const totalItems = items.length;
  const totalPieces = items.reduce((sum, item) => sum + item.pieces, 0);
  const needsAttention = items.filter(
    (item) => item.status === "poor" || item.status === "broken"
  ).length;

  const stats = [
    {
      title: "総アイテム数",
      value: totalItems,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "総数量",
      value: totalPieces,
      icon: FolderOpen,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "カテゴリ数",
      value: categories.length,
      icon: FolderOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "要注意アイテム",
      value: needsAttention,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const recentItems = items.slice(0, 5);
  const teamLabelMap: Record<string, string> = {
    experiment: "実験班",
    robot: "ロボット班",
    bio: "生物班",
    space: "宇宙班",
    ai: "AI班",
  };

  const nextActivityDateLabel = nextActivityDay
    ? new Date(nextActivityDay.date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    : null;

  return (
    <>
      {/* 初回班選択ダイアログ */}
      {showTeamDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-xl min-w-[320px] flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">最初に所属班を選択してください</h2>
            <div className="mb-4 w-full space-y-2">
              {teamOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={teamSelect.includes(opt.value)}
                    onChange={() => toggleTeamSelection(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {teamDialogError && (
              <p className="mb-3 w-full text-sm text-red-500">{teamDialogError}</p>
            )}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={teamSelect.length === 0 || registeringTeam}
              onClick={handleTeamRegister}
            >
              {registeringTeam ? "登録中..." : "登録"}
            </button>
          </div>
        </div>
      )}
      <div className="space-y-6 w-full max-w-none px-0 text-left items-start justify-start">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start justify-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">最近書いたポートフォリオ</CardTitle>
            </CardHeader>
            <CardContent>
              {!recentPortfolioItems || recentPortfolioItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  ポートフォリオの投稿がありません
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPortfolioItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/portfolio/${item.id}`}
                      className="block rounded-lg p-3 bg-muted/40 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium line-clamp-1">{item.title}</p>
                        <Badge variant="secondary" className="shrink-0">
                          {new Date(item.updatedAt).toLocaleDateString("ja-JP")}
                        </Badge>
                      </div>
                      {item.summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">次の活動日</CardTitle>
            </CardHeader>
            <CardContent>
              {!nextActivityDay || !nextActivityDateLabel ? (
                <p className="text-muted-foreground text-center py-4">
                  予定されている活動日はありません
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">{nextActivityDateLabel}</p>
                    <p className="text-sm text-muted-foreground mt-1">次回の予約日</p>
                  </div>
                  {nextActivityDay.use && (
                    <div>
                      <p className="text-xs text-muted-foreground">使用班</p>
                      <p className="font-medium">{teamLabelMap[nextActivityDay.use] ?? nextActivityDay.use}</p>
                    </div>
                  )}
                  {nextActivityDay.about && (
                    <div>
                      <p className="text-xs text-muted-foreground">活動内容</p>
                      <p className="font-medium line-clamp-2">{nextActivityDay.about}</p>
                    </div>
                  )}
                  <Link
                    to="/activity"
                    className="inline-block text-sm text-blue-600 hover:text-blue-700"
                  >
                    活動日カレンダーを見る
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full items-start justify-start">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center p-6">
                <div className={`p-3 rounded-full ${stat.bgColor} mr-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start justify-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">最近のアイテム</CardTitle>
            </CardHeader>
            <CardContent>
              {recentItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  アイテムがありません
                </p>
              ) : (
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 opacity-60 cursor-not-allowed"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.category || "未分類"} • {item.location}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        x{item.pieces}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  カテゴリがありません
                </p>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => {
                    const count = items.filter(
                      (item) => item.category === category
                    ).length;
                    return (
                      <Link
                        key={category}
                        to={`/items?category=${category}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">
                          {count}件
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
