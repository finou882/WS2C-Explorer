import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const teamOptions = [
  { value: 'experiment', label: '実験班' },
  { value: 'robot', label: 'ロボット班' },
  { value: 'bio', label: '生物班' },
  { value: 'space', label: '宇宙班' },
  { value: 'ai', label: 'AI班' },
];

function parsePermissions(values: string[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentTeams, setCurrentTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPermissions = async (email: string | null) => {
    if (!email) {
      setCurrentTeams([]);
      setLoading(false);
      return;
    }

    const { data: permData, error } = await supabase
      .from("users_permission")
      .select("permission")
      .eq("email", email);

    if (error) {
      setErrorMessage(`初期値の取得に失敗しました: ${error.message}`);
      setLoading(false);
      return;
    }

    setCurrentTeams(parsePermissions((permData ?? []).map((row: { permission: string }) => row.permission)));
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email ?? null;
        if (!mounted) return;
        setUserEmail(email);
        await loadPermissions(email);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(`初期値の取得に失敗しました: ${(error as Error).message}`);
        setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const email = session?.user?.email ?? null;
      if (!mounted) return;
      setLoading(true);
      setUserEmail(email);
      setErrorMessage(null);
      setMessage(null);
      await loadPermissions(email);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const toggleTeamSelection = (value: string) => {
    setCurrentTeams((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    if (!userEmail || currentTeams.length === 0) return;
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    const { error } = await supabase
      .from("users_permission")
      .upsert(
        {
          email: userEmail,
          permission: currentTeams.join(","),
        },
        { onConflict: "email" }
      );

    if (error) {
      setSaving(false);
      setErrorMessage(`保存に失敗しました: ${error.message}`);
      return;
    }

    localStorage.setItem(`team-dialog-seen:${userEmail}`, "1");
    setSaving(false);
    setMessage("所属班を保存しました。");
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      {loading ? (
        <div>読み込み中...</div>
      ) : (
        <>
          {!userEmail && (
            <div className="mb-4 text-sm text-muted-foreground">ログインすると所属班を編集できます。</div>
          )}

          {userEmail && (
            <div className="mb-4">
              <label className="block mb-2">所属班（複数選択可）</label>
              <div className="space-y-2 border rounded px-3 py-3">
              {teamOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentTeams.includes(opt.value)}
                    onChange={() => toggleTeamSelection(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
              </div>
            </div>
          )}

          {errorMessage && <p className="mb-3 text-sm text-red-500">{errorMessage}</p>}
          {message && <p className="mb-3 text-sm text-green-600">{message}</p>}

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!userEmail || currentTeams.length === 0 || saving}
            onClick={handleSave}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </>
      )}
    </div>
  );
}

export default SettingsPage;
