import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Input, Textarea, Button } from "@/components/ui";
import { useThemeMode } from "@/hooks/useThemeMode";
import { getPortfolioItemById, parseTags, upsertPortfolioItem } from "@/lib/portfolioStorage";
import { supabase } from "@/lib/supabase";

export default function PortfolioEditorPage() {
  const [dark] = useThemeMode();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [author, setAuthor] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = isEdit ? "ポートフォリオ編集 | WS2C Explorer" : "ポートフォリオ新規作成 | WS2C Explorer";
  }, [isEdit]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted) return;
      setIsLoggedIn(Boolean(user));
      setAuthor(
        user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email ||
          ""
      );
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setIsLoggedIn(Boolean(user));
      setAuthor(
        user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email ||
          ""
      );
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;
    (async () => {
      const item = await getPortfolioItemById(id);
      if (!item) {
        navigate("/portfolio", { replace: true });
        return;
      }
      if (!mounted) return;
      setTitle(item.title);
      setSummary(item.summary);
      setTagsInput(item.tags.join(", "));
      setMarkdown(item.markdown);
    })();

    return () => {
      mounted = false;
    };
  }, [id, isEdit, navigate]);

  const handleSave = async () => {
    if (!isLoggedIn) return;
    const normalizedTitle = title.trim();
    const normalizedMarkdown = markdown.trim();
    if (!normalizedTitle || !normalizedMarkdown) return;
    setError(null);

    const itemId = id ?? crypto.randomUUID();
    try {
      await upsertPortfolioItem({
        id: itemId,
        title: normalizedTitle,
        summary: summary.trim(),
        tags: parseTags(tagsInput),
        markdown: normalizedMarkdown,
        author: author || "不明",
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
      return;
    }

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
          {!isLoggedIn && (
            <p className="text-sm text-muted-foreground">ログインすると保存できます。</p>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <Input
            placeholder="タイトル (例: 在庫管理アプリ v2)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isLoggedIn}
          />

          <Textarea
            placeholder="要約 (1〜2行)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            disabled={!isLoggedIn}
          />

          <Input
            placeholder="タグをカンマ区切りで入力 (例: React, Supabase, UI)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            disabled={!isLoggedIn}
          />

          <div data-color-mode={dark ? "dark" : "light"}>
            <MDEditor
              value={markdown}
              onChange={(value) => {
                if (!isLoggedIn) return;
                setMarkdown(value ?? "");
              }}
              height={420}
              textareaProps={{
                placeholder:
                  "ここに説明を書くだけでOKです。\n\n# 見出し\n- 箇条書き\n[リンク](https://example.com)",
              }}
              visibleDragbar={false}
              preview={isLoggedIn ? "edit" : "preview"}
            />
          </div>

          <Button onClick={handleSave} disabled={!isLoggedIn || !title.trim() || !markdown.trim()}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
