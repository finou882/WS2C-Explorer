import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, FolderOpen, AlertTriangle } from "lucide-react";
import { itemsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { fetchRecentActivityDays } from "@/lib/recentActivityApi"; // ←これを追加

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [teamSelect, setTeamSelect] = useState("");
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

  // userEmailがセットされたらpermissionチェック
  useEffect(() => {
    if (!userEmail) return;
    let ignore = false;
    (async () => {
      const { data: permData, error } = await supabase.from('users_permission').select('permission').eq('email', userEmail);
      console.log('userEmail:', userEmail, 'permission:', permData, 'error:', error);
      if (!ignore && !error && (!permData || permData.length === 0)) {
        setShowTeamDialog(true);
      }
    })();
    return () => { ignore = true; };
  }, [userEmail]);

  // 班登録ハンドラ
  const handleTeamRegister = async () => {
    if (!userEmail || !teamSelect) return;
    await supabase.from('users_permission').insert([{ email: userEmail, permission: teamSelect }]);
    setShowTeamDialog(false);
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

  // 直近一週間の活動日
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  useEffect(() => {
    fetchRecentActivityDays(7).then(setRecentActivity).catch(() => setRecentActivity([]));
  }, []);
  // 曜日変換
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  const recentWeekdays = recentActivity.map(date => weekDays[new Date(date).getDay()]);

  return (
    <>
      {/* 初回班選択ダイアログ */}
      {showTeamDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-xl min-w-[320px] flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">最初に所属班を選択してください</h2>
            <select className="border rounded px-2 py-1 mb-4 w-full" value={teamSelect} onChange={e => setTeamSelect(e.target.value)}>
              <option value="">選択してください</option>
              {teamOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={!teamSelect} onClick={handleTeamRegister}>登録</button>
          </div>
        </div>
      )}
      <div className="space-y-6 w-full max-w-none px-0 text-left items-start justify-start">
        {/* 直近一週間の活動曜日 */}
        <div className="mb-2">
          <span className="font-semibold">直近一週間の活動曜日：</span>
          {recentWeekdays.length === 0 ? (
            <span className="text-muted-foreground">（記録なし）</span>
          ) : (
            <span>{recentWeekdays.join("・")}</span>
          )}
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
