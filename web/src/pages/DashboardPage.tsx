import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, FolderOpen, AlertTriangle, Plus } from "lucide-react";
import { itemsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { fetchRecentActivityDays } from "@/lib/recentActivityApi"; // ←これを追加

export default function DashboardPage() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <Link to="/items/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規アイテム
          </Button>
        </Link>
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
            <CardTitle>最近のアイテム</CardTitle>
          </CardHeader>
          <CardContent>
            {recentItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                アイテムがありません
              </p>
            ) : (
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
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
                  </Link>
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
  );
}
