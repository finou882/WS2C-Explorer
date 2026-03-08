# 部活所有物管理システム / Club Inventory

サイエンス部向けの所有物管理Webアプリケーション。Cloudflare Workers + Supabase で構築。

## 技術スタック

- **API**: [Hono](https://hono.dev/) on Cloudflare Workers
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: [Supabase](https://supabase.com/)
- **State Management**: TanStack Query (React Query)

## プロジェクト構造

```
.
├── api/                 # Hono API (Cloudflare Workers)
│   ├── src/
│   │   ├── index.ts     # エントリポイント
│   │   ├── routes/      # APIルート
│   │   └── lib/         # ユーティリティ
│   └── wrangler.toml    # Workers設定
├── web/                 # React SPA (Cloudflare Pages)
│   ├── src/
│   │   ├── components/  # UIコンポーネント
│   │   ├── pages/       # ページコンポーネント
│   │   ├── contexts/    # Reactコンテキスト
│   │   ├── lib/         # API クライアント等
│   │   └── types/       # TypeScript型定義
│   └── vite.config.ts
└── supabase/            # Supabase設定
    ├── migrations/      # DBマイグレーション
    └── seed.sql         # サンプルデータ
```

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. `supabase/migrations/001_initial_schema.sql` をSQLエディタで実行
3. （オプション）`supabase/seed.sql` でサンプルデータを投入

### 3. 環境変数の設定

**web/.env**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8787
```

**api/.dev.vars**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. 開発サーバーの起動

```bash
# APIとフロントエンドを同時に起動
pnpm dev

# または個別に起動
pnpm dev:api   # API (localhost:8787)
pnpm dev:web   # Frontend (localhost:5173)
```

## デプロイ

### APIのデプロイ (Cloudflare Workers)

```bash
cd api

# シークレットの設定
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# デプロイ
pnpm deploy
```

### フロントエンドのデプロイ (Cloudflare Pages)

```bash
cd web
pnpm deploy
```

または、GitHubリポジトリをCloudflare Pagesに接続して自動デプロイ。

## 機能

- ✅ ユーザー認証 (Supabase Auth)
- ✅ アイテムのCRUD
- ✅ カテゴリ管理
- ✅ 検索・フィルタリング
- ✅ 履歴追跡
- ✅ レスポンシブデザイン

## 今後の拡張予定

- [ ] 貸出/返却機能
- [ ] 在庫アラート
- [ ] 画像アップロード
- [ ] QRコード/バーコード対応
- [ ] レポート機能

## ライセンス

MIT
