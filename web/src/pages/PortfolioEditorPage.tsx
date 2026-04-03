import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Input, Textarea, Button } from "@/components/ui";
import { useThemeMode } from "@/hooks/useThemeMode";
import { getPortfolioItemById, parseTags, upsertPortfolioItem } from "@/lib/portfolioStorage";

export default function PortfolioEditorPage() {
  const [dark] = useThemeMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    document.title = isEdit ? "ポートフォリオ編集 | WS2C Explorer" : "ポートフォリオ新規作成 | WS2C Explorer";
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit || !id) return;
    const item = getPortfolioItemById(id);
    if (!item) {
      navigate("/portfolio", { replace: true });
      return;
    }

    setTitle(item.title);
    setSummary(item.summary);
    setTagsInput(item.tags.join(", "));
    setMarkdown(item.markdown);
  }, [id, isEdit, navigate]);

  const handleSave = () => {
    const normalizedTitle = title.trim();
    const normalizedMarkdown = markdown.trim();
    if (!normalizedTitle || !normalizedMarkdown) return;

    const itemId = id ?? crypto.randomUUID();
    upsertPortfolioItem({
      id: itemId,
      title: normalizedTitle,
      summary: summary.trim(),
      tags: parseTags(tagsInput),
      markdown: normalizedMarkdown,
      updatedAt: new Date().toISOString(),
    });

    navigate(`/portfolio/${itemId}`);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEdit ? "ポートフォリオ編集" : "ポートフォリオ新規作成"}</h1>
        <Link to="/portfolio">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            一覧へ戻る
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>記事内容</CardTitle>
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
              height={420}
              textareaProps={{
                placeholder:
                  "ここに説明を書くだけでOKです。\n\n# 見出し\n- 箇条書き\n[リンク](https://example.com)",
              }}
              visibleDragbar={false}
              preview="edit"
            />
          </div>

          <Button onClick={handleSave} disabled={!title.trim() || !markdown.trim()}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
