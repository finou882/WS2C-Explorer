  // ...existing code...
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { itemsApi } from "@/lib/api";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  good: { label: "良好", variant: "success" },
  fair: { label: "普通", variant: "secondary" },
  poor: { label: "要注意", variant: "warning" },
  broken: { label: "故障", variant: "destructive" },
};

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: itemData, isLoading } = useQuery({
    queryKey: ["items", id],
    queryFn: () => itemsApi.get(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => itemsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate("/items");
    },
  });

  const item = itemData?.item;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">アイテムが見つかりません</p>
        <Link to="/items" className="mt-4 inline-block">
          <Button variant="outline">一覧に戻る</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = statusLabels[item.status] ?? { label: item.status, variant: "secondary" as const };

  useEffect(() => {
    document.title = item ? `${item.name} | WS2C Explorer` : "アイテム詳細 | WS2C Explorer";
  }, [item]);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/items">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex-1">{item.name}</h1>
        <Link to={`/items/${id}/edit`}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            編集
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          削除
        </Button>
      </div>

      {showDeleteConfirm && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="font-medium mb-4">
              本当に「{item.name}」を削除しますか？
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "削除中..." : "削除する"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">カテゴリ</p>
              <p className="font-medium mt-1">{item.category || "未分類"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">状態</p>
              <Badge variant={statusInfo.variant} className="mt-1">
                {statusInfo.label}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">数量</p>
              <p className="font-semibold text-lg mt-1">{item.pieces}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">保管場所</p>
              <p className="mt-1">{item.location || "未設定"}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              更新日時: {new Date(item.timestamp).toLocaleString("ja-JP")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
