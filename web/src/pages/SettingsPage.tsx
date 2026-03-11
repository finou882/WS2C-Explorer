import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const teamOptions = [
  { value: 'experiment', label: '実験班' },
  { value: 'robot', label: 'ロボット班' },
  { value: 'bio', label: '生物班' },
  { value: 'space', label: '宇宙班' },
  { value: 'ai', label: 'AI班' },
];

function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // ユーザー未ログイン時は何も表示しない
  if (userEmail === null) return null;
  const [currentTeam, setCurrentTeam] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      setUserEmail(email);
      if (!email) return setLoading(false);
      const { data: permData } = await supabase.from('users_permission').select('permission').eq('email', email);
      setCurrentTeam(permData?.[0]?.permission ?? "");
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!userEmail || !currentTeam) return;
    setSaving(true);
    // 既存レコードがあればupdate、なければinsert
    const { data: exist } = await supabase.from('users_permission').select('permission').eq('email', userEmail);
    if (exist && exist.length > 0) {
      await supabase.from('users_permission').update({ permission: currentTeam }).eq('email', userEmail);
    } else {
      await supabase.from('users_permission').insert([{ email: userEmail, permission: currentTeam }]);
    }
    setSaving(false);
    alert('班を更新しました');
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      {loading ? (
        <div>読み込み中...</div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-1">所属班</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={currentTeam}
              onChange={e => setCurrentTeam(e.target.value)}
            >
              <option value="">選択してください</option>
              {teamOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          // ...existing code...
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!currentTeam || saving}
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
