  // ...existing code...
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Package } from "lucide-react";
import { itemsApi } from "@/lib/api";
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  Badge,
} from "@/components/ui";

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  good: { label: "良好", variant: "success" },
  fair: { label: "普通", variant: "secondary" },
  poor: { label: "要注意", variant: "warning" },
  broken: { label: "故障", variant: "destructive" },
};

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const category = searchParams.get("category") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["items", category, status, searchParams.get("search")],
    queryFn: () =>
      itemsApi.list({
        category,
        status,
        search: searchParams.get("search") ?? undefined,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => itemsApi.getCategories(),
  });

  const items = itemsData?.items ?? [];
  const categories = categoriesData?.categories ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    document.title = "アイテム一覧 | WS2C Explorer";
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">アイテム一覧</h1>
        <Link to="/items/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規アイテム
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            検索
          </Button>
        </form>

        <Select
          value={category ?? ""}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Select
          value={status ?? ""}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full sm:w-36"
        >
          <option value="">すべての状態</option>
          <option value="good">良好</option>
          <option value="fair">普通</option>
          <option value="poor">要注意</option>
          <option value="broken">故障</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">アイテムがありません</p>
            <Link to="/items/new" className="mt-4">
              <Button variant="outline">アイテムを追加</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const statusInfo = statusLabels[item.status] ?? { label: item.status, variant: "secondary" as const };
            return (
                <Card key={item.id} className="h-full opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {item.name}
                      </h3>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.category || "未分類"}
                      </span>
                      <span className="font-medium">x{item.pieces}</span>
                    </div>
                    {item.location && (
                      <p className="text-xs text-muted-foreground mt-2">
                        📍 {item.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
