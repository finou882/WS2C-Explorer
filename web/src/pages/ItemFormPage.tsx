
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { itemsApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { CreateItemInput } from "@/types";
import {
  Button,
  Input,
  Label,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";

export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<CreateItemInput>({
    name: "",
    pieces: 1,
    category: "",
    status: "good",
    location: "",
  });
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setIsLoggedIn(Boolean(data.user));
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const { data: itemData } = useQuery({
    queryKey: ["items", id],
    queryFn: () => itemsApi.get(id!),
    enabled: isEditing,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["items", "categories"],
    queryFn: () => itemsApi.getCategories(),
  });

  const existingCategories = categoriesData?.categories ?? [];

  useEffect(() => {
    if (itemData?.item) {
      const item = itemData.item;
      setFormData({
        name: item.name,
        pieces: item.pieces,
        category: item.category ?? "",
        status: item.status ?? "good",
        location: item.location ?? "",
      });
    }
  }, [itemData]);

  const createMutation = useMutation({
    mutationFn: (data: CreateItemInput) => itemsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate(`/items/${data.item.id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateItemInput) => itemsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate(`/items/${id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoggedIn && !isEditing) {
      setError("ログインすると新規作成できます。");
      return;
    }

    const data: CreateItemInput = {
      name: formData.name,
      pieces: formData.pieces,
      category: formData.category || undefined,
      status: formData.status || undefined,
      location: formData.location || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-4">
        <Link to={isEditing ? `/items/${id}` : "/items"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? "アイテム編集" : "新規アイテム"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>アイテム情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {!isLoggedIn && !isEditing && (
              <div className="p-3 rounded-md bg-muted text-muted-foreground text-sm">
                ログインすると新規アイテムを作成できます。
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">名前 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="例: Arduino Uno"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ</Label>
                <Input
                  id="category"
                  value={formData.category ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="例: 電子部品"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pieces">数量</Label>
                <Input
                  id="pieces"
                  type="number"
                  min={0}
                  value={formData.pieces}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pieces: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">状態</Label>
                <Select
                  id="status"
                  value={formData.status ?? "good"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="good">良好</option>
                  <option value="fair">普通</option>
                  <option value="poor">要注意</option>
                  <option value="broken">故障</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">保管場所</Label>
                <Input
                  id="location"
                  value={formData.location ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="例: 棚A-3"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isPending || (!isLoggedIn && !isEditing)}>
                {isPending ? "保存中..." : isEditing ? "更新" : "作成"}
              </Button>
              <Link to={isEditing ? `/items/${id}` : "/items"}>
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
