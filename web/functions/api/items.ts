// Cloudflare Pages Functions: Items API
import { type RequestHandler } from '@cloudflare/pages-plugin-router';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

const getSupabase = (env: any) =>
  createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const onRequestGet: RequestHandler = async ({ request, env }) => {
  const url = new URL(request.url);
  const supabase = getSupabase(env);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const status = url.searchParams.get('status');

  let query = supabase.from('pos').select('*').order('timestamp', { ascending: false });
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return new Response(JSON.stringify({ error: 'Failed to fetch items' }), { status: 500 });
  return new Response(JSON.stringify({ items: data }), { headers: { 'Content-Type': 'application/json' } });
};

export const onRequestPost: RequestHandler = async ({ request, env }) => {
  const supabase = getSupabase(env);
  const body = await request.json();
  const insertData = {
    name: body.name,
    pieces: body.pieces ?? 1,
    category: body.category ?? '',
    status: body.status ?? 'good',
    location: body.location ?? '',
    timestamp: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('pos').insert(insertData).select().single();
  if (error) return new Response(JSON.stringify({ error: 'Failed to create item' }), { status: 500 });
  return new Response(JSON.stringify({ item: data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};
