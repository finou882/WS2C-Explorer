// Cloudflare Pages Functions: Activity API
import type { RequestHandler } from '@cloudflare/pages-plugin-router';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

const getSupabase = (env: any) =>
  createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const onRequestGet: RequestHandler = async (context: any) => {
  const { env } = context;
  const supabase = getSupabase(env);
  const { data, error } = await supabase
    .from('activity_days')
    .select('id, date, created_at, updated_at')
    .order('date', { ascending: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ days: data }), { headers: { 'Content-Type': 'application/json' } });
};

export const onRequestPost: RequestHandler = async (context: any) => {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const body = await request.json();
  if (!body.date) return new Response(JSON.stringify({ error: 'date is required' }), { status: 400 });
  const { data, error } = await supabase.from('activity_days').insert([{ date: body.date }]).select();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ day: data[0] }), { headers: { 'Content-Type': 'application/json' } });
};

export const onRequestDelete: RequestHandler = async (context: any) => {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ error: 'id is required' }), { status: 400 });
  const { error } = await supabase.from('activity_days').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
