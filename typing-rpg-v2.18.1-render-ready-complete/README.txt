TYPE RAID 2.0

ゼロから再構築した2人協力ローマ字タイピングRPG。

主な機能
- Socket.IO 2人オンライン協力
- 1000種類以上の出題候補（単語/複合語/文章/長文）
- 1文字ごとの青/ピンク文字弾
- 25コンボ CRITICAL
- LINK ATTACK
- BOSS BREAK
- REVIVE / TEAM HEAL
- ボス待機・被弾・攻撃・BREAK・PHASE 2・撃破アニメーション
- BGM / SE 音量調整
- バトルログ / WPM / ACC
- 背景・ボス・プレイヤー・UI・エフェクトを別レイヤー化（画像切り抜き方式ではありません）

起動
1. PowerShellでこのフォルダへ移動
2. npm install
3. npm start
4. http://localhost:3000 を開く

友達とインターネット越しに遊ぶ場合（以前と同じ）
別PowerShellで cloudflared tunnel --url http://localhost:3000
表示された trycloudflare.com のURLを共有。
