import { useState, useRef, useEffect } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from "../lib/supabase";

// Utility to get reservation by date
type Reservation = { id?: string; date: string; use: string; about: string };
function findReservationByDate(reservations: Reservation[], date: Date): Reservation | undefined {
  const ymd = date.toLocaleDateString('sv-SE');
  return reservations.find((r: Reservation) => r.date === ymd);
}

export default function ActivityPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelDate, setPanelDate] = useState<Date | null>(null);
  const [form, setForm] = useState<{ about: string; team: string }>({ about: '', team: '' });
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [reservations, setReservations] = useState<{ id?: string; date: string; use: string; about: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('activity_days').select('id, date, use, about');
      if (!error && data) {
        setReservations(
          data
            .map((row: { id?: string; date: string; use: string; about: string }) => ({
              id: row.id,
              date: row.date,
              use: row.use,
              about: row.about || ''
            }))
            .filter(r => !!r.date)
        );
      }
    })();
  }, []);

  useEffect(() => {
    document.title = "活動日カレンダー | WS2C Explorer";
  }, []);

  // Map team value to label for display
  const teamOptions = [
    { value: 'experiment', label: '実験班' },
    { value: 'robot', label: 'ロボット班' },
    { value: 'bio', label: '生物班' },
    { value: 'space', label: '宇宙班' },
    { value: 'ai', label: 'AI班' },
  ];
  const getTeamLabel = (value: string) => {
    const found = teamOptions.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  const events = reservations.map(rsv => ({
    title: rsv.use ? `予約: ${getTeamLabel(rsv.use)}` : '予約済',
    start: rsv.date,
    allDay: true,
    color: '#1976d2',
    textColor: '#fff',
  }));

  const handleSelect = (arg: any) => {
    setPanelDate(new Date(arg.startStr));
    setPanelOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReserve = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!panelDate) return;
    const ymd = panelDate.toLocaleDateString('sv-SE');
    const { error, data } = await supabase.from('activity_days').insert([
      {
        date: ymd,
        about: form.about,
        use: form.team,
        created_at: new Date().toISOString(),
      }
    ]).select();
    if (!error && data && data[0]) {
      setReservations([...reservations, { id: data[0].id, date: ymd, use: form.team, about: form.about }]);
    } else {
      alert('予約の保存に失敗しました');
    }
    setPanelOpen(false);
    setForm({ about: '', team: '' });
    setPanelDate(null);
  };

  // 予約キャンセル処理
  const handleCancel = async () => {
    if (!panelDate) return;
    const rsv = findReservationByDate(reservations, panelDate);
    if (!rsv || !rsv.id) return;
    const { error } = await supabase.from('activity_days').delete().eq('id', rsv.id);
    if (!error) {
      setReservations(reservations.filter(r => r.id !== rsv.id));
      setPanelOpen(false);
      setForm({ about: '', team: '' });
      setPanelDate(null);
    } else {
      alert('キャンセルに失敗しました');
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setPanelDate(null), 300);
  };



  return (
    <>
    <div className="w-full min-h-screen flex flex-col items-start p-12 bg-gray-50 relative min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8">活動日カレンダー</h1>
      <div className="border rounded-2xl shadow-2xl bg-white p-2" style={{ minWidth: 320, maxWidth: 700 }}>
        {/* FullCalendar JSX re-enabled */}
        {FullCalendar && (
          // JSXエラー回避: React.createElementで描画
          // @ts-ignore
          React.createElement(FullCalendar, {
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: "dayGridMonth",
            height: "auto",
            events: events,
            selectable: true,
            select: handleSelect,
          })
        )}
      </div>
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">活動予約</h2>
            <button onClick={closePanel} className="text-2xl font-bold text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="mb-2 text-lg">日付: {panelDate ? panelDate.toLocaleDateString() : ''}</div>
          <form onSubmit={handleReserve}>
            <div className="mb-4">
              <label className="block mb-1">活動内容</label>
              <input name="about" value={form.about} onChange={handleFormChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">活動内容</label>
              <input name="about" value={form.about} onChange={handleFormChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">使用班</label>
              <select name="team" value={form.team} onChange={handleFormChange} className="border rounded px-2 py-1 w-full" required>
                {teamOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">予約</button>
              {/* 予約が存在する場合のみキャンセルボタンを表示 */}
              {panelDate && findReservationByDate(reservations, panelDate) && (
                <button type="button" onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">キャンセル</button>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Version info bottom right */}
    </div>
    {/* Version info bottom right, always on viewport */}
    <div className="fixed bottom-2 right-4 text-xs text-gray-400 select-none z-[9999] pointer-events-none">
      v1.0.0-alpha by Finou
    </div>
    </>
  );
}
