import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/markdown.css";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { deletePortfolioItem, getPortfolioItemById } from "@/lib/portfolioStorage";
import { useThemeMode } from "@/hooks/useThemeMode";
import { supabase } from "@/lib/supabase";

export default function PortfolioDetailPage() {
  const [dark] = useThemeMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [item, setItem] = useState<Awaited<ReturnType<typeof getPortfolioItemById>>>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      setIsLoading(true);
      const next = await getPortfolioItemById(id);
      if (mounted) {
        setItem(next);
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    document.title = item ? `${item.title} | WS2C Explorer` : "ポートフォリオ詳細 | WS2C Explorer";
  }, [item]);

  const handleDelete = async () => {
    if (!isLoggedIn || !id) return;
    const ok = window.confirm("この記事を削除しますか？");
    if (!ok) return;
    await deletePortfolioItem(id);
    navigate("/portfolio");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">記事が見つかりませんでした。</p>
        <Link to="/portfolio">
          <Button variant="secondary">一覧へ戻る</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          {item.summary && <p className="text-muted-foreground">{item.summary}</p>}
          <p className="text-xs text-muted-foreground">作成者: {item.author || "不明"}</p>
          <div className="flex flex-wrap gap-1">
            {item.tags.length === 0 ? (
              <Badge variant="outline">タグなし</Badge>
            ) : (
              item.tags.map((tag) => (
                <Badge key={`${item.id}-${tag}`} variant="outline">{tag}</Badge>
              ))
            )}
            <Badge variant="secondary">{new Date(item.updatedAt).toLocaleString()}</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to="/portfolio">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              一覧
            </Button>
          </Link>
          <Link to={`/portfolio/${item.id}/edit`}>
            <Button variant="outline">
              <Pencil className="w-4 h-4 mr-2" />
              編集
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isLoggedIn}
            title={!isLoggedIn ? "ログインすると削除できます" : undefined}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6" data-color-mode={dark ? "dark" : "light"}>
          <MDEditor.Markdown source={item.markdown} style={{ background: "transparent" }} />
        </CardContent>
      </Card>
    </div>
  );
}
