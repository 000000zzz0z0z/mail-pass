# 捨てメアド 受け渡しサイト（Netlify版）

## 1. 管理者パスワードの設定（必須）
管理者パスワードはコードには書かず、Netlify の環境変数で設定します。
Netlify のサイト設定 →「Environment variables」→「Add a variable」
- Key: `ADMIN_PASSWORD`
- Value: 管理者パスワード

設定後は一度「Deploys」→「Trigger deploy」で再デプロイしてください。

## 2. 公開方法 A：GitHub 経由（おすすめ）
1. このフォルダをそのまま GitHub の新しいリポジトリにアップロード
2. Netlify →「Add new site」→「Import an existing project」→ リポジトリを選択
3. 設定は netlify.toml から自動で読まれるので、そのまま「Deploy」
4. 表示された `https://〜.netlify.app` が公開URL

## 公開方法 B：Netlify CLI
```
npm install
npx netlify-cli login
npx netlify-cli env:set ADMIN_PASSWORD "管理者パスワード"
npx netlify-cli deploy --prod
```

※ ドラッグ&ドロップ公開（Netlify Drop）は Functions が動かないため使えません。

## 構成
- `public/index.html` … 画面。トップは受け渡しパスワードで開く受信箱、右下の「管理者用」から発行画面へ
- `netlify/functions/api.mjs` … 管理者確認・受け渡しデータの保存と取り出し（Netlify Blobs に保存）
- メールアドレスの作成と受信は mail.tm の公式API（https://docs.mail.tm）をブラウザから直接使います

## 使い方
- 管理者：「管理者用」→ パスワード → アドレス名を決めて「アドレスを作って受け渡しパスワードを発行」
- 相手：トップで受け渡しパスワードを入れる → このサイト上で受信箱が開き、10秒ごとに自動更新

## 公開前に手元で試す
```
npm install
npx netlify-cli dev
```
表示された http://localhost:8888 で、Netlify と同じ動きを確認できます（ADMIN_PASSWORD は `.env` ファイルに `ADMIN_PASSWORD=...` と書く）。

## mail.tm の利用条件
- 画面左下の「受信: mail.tm」リンクは mail.tm の利用条件（出典表示）なので消さないでください
- mail.tm の API を有料サービスとして再販したり、別ドメインで中継したりすることは禁止されています
- 受信したメールの保存期間は mail.tm 側の方針によります
