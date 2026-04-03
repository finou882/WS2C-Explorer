import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/markdown.css";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { deletePortfolioItem, getPortfolioItemById } from "@/lib/portfolioStorage";
import { useThemeMode } from "@/hooks/useThemeMode";

export default function PortfolioDetailPage() {
  const [dark] = useThemeMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const item = useMemo(() => {
    if (!id) return null;
    return getPortfolioItemById(id);
  }, [id]);

  useEffect(() => {
    document.title = item ? `${item.title} | WS2C Explorer` : "ポートフォリオ詳細 | WS2C Explorer";
  }, [item]);

  const handleDelete = () => {
    if (!id) return;
    const ok = window.confirm("この記事を削除しますか？");
    if (!ok) return;
    deletePortfolioItem(id);
    navigate("/portfolio");
  };

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
          <Button variant="destructive" onClick={handleDelete}>
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
