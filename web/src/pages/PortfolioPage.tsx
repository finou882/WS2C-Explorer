import { useEffect, useMemo, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Search, Plus, Pencil, Trash2, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  Button,
  Badge,
} from "@/components/ui";
import { useThemeMode } from "@/hooks/useThemeMode";

type PortfolioItem = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  markdown: string;
  updatedAt: string;
};

const STORAGE_KEY = "portfolio-items-v1";

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

export default function PortfolioPage() {
  const [dark] = useThemeMode();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ポートフォリオ | WS2C Explorer";
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as PortfolioItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setTagsInput("");
    setMarkdown("");
    setEditingId(null);
  };

  const handleSave = () => {
    const normalizedTitle = title.trim();
    const normalizedMarkdown = (markdown ?? "").trim();
    if (!normalizedTitle || !normalizedMarkdown) return;

    const payload: PortfolioItem = {
      id: editingId ?? crypto.randomUUID(),
      title: normalizedTitle,
      summary: summary.trim(),
      tags: parseTags(tagsInput),
      markdown: normalizedMarkdown,
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => {
      if (!editingId) return [payload, ...prev];
      return prev.map((item) => (item.id === editingId ? payload : item));
    });
    resetForm();
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSummary(item.summary);
    setTagsInput(item.tags.join(", "));
    setMarkdown(item.markdown);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ポートフォリオ</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "ポートフォリオ編集" : "ポートフォリオ追加"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="タイトル (例: 在庫管理アプリ v2)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="要約 (1〜2行)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
          />
          <Input
            placeholder="タグをカンマ区切りで入力 (例: React, Supabase, UI)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <div data-color-mode={dark ? "dark" : "light"}>
            <MDEditor
              value={markdown}
              onChange={(value) => setMarkdown(value ?? "")}
              height={340}
              textareaProps={{
                placeholder:
                  "ここに説明を書くだけでOKです。\n\n# 見出し\n- 箇条書き\n[リンク](https://example.com)",
              }}
              visibleDragbar={false}
              preview="edit"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!title.trim() || !(markdown ?? "").trim()}>
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "更新" : "追加"}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={resetForm}>編集をキャンセル</Button>
            )}
          </div>
        </CardContent>
      </Card>

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
            <Card key={item.id} className="h-full">
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

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4 mr-1" />
                    編集
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
