import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, FileText } from "lucide-react";
import { Card, CardContent, Input, Button, Badge } from "@/components/ui";
import { loadPortfolioItems, stripMarkdown, type PortfolioItem } from "@/lib/portfolioStorage";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "ポートフォリオ | WS2C Explorer";
  }, []);

  useEffect(() => {
    setItems(loadPortfolioItems());
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const text = [item.title, item.summary, item.tags.join(" "), stripMarkdown(item.markdown)]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [items, search]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ポートフォリオ</h1>
        <Link to="/portfolio/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新規
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ポートフォリオを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ポートフォリオがありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Link key={item.id} to={`/portfolio/${item.id}`}>
            <Card className="h-full hover:bg-muted/40 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                  <Badge variant="secondary">{new Date(item.updatedAt).toLocaleDateString()}</Badge>
                </div>

                {item.summary && <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>}
                <p className="text-sm text-muted-foreground line-clamp-3">{stripMarkdown(item.markdown)}</p>

                <div className="flex flex-wrap gap-1">
                  {item.tags.length === 0 ? (
                    <Badge variant="outline">タグなし</Badge>
                  ) : (
                    item.tags.map((tag) => (
                      <Badge key={`${item.id}-${tag}`} variant="outline">{tag}</Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
