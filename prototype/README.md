# 都道府県マスター：県図鑑プロトタイプ（関東）

本番版とは分離した試作ルートです。既存のクイズ、地図、MASTER条件、localStorageの保存キーには触れていません。

## 現在の試作内容
- 関東7都県のページ切り替え
- 5カテゴリ×7都県＝35項目のデータ構造
- 各項目の短い説明
- 写真カードと写真選定中カードの表示
- 写真ごとの作者・ライセンス・Commons原ページ表示
- タブレット／スマートフォン向けレイアウト
- 図鑑の閲覧はMASTER条件に影響しない

## 写真の進捗
- Commons原ページと作者・ライセンスを確認した写真：11点
- 写真の選定・権利確認が残っている項目：24点
- ローカルWebP配置：未実施（次の作業）
- 現在の写真表示はCommonsのSpecial:FilePathを参照する確認用です。最終仕様のB案ではありません。

写真の出典・作者・ライセンスは `data/kanto-gallery.json` に項目単位で保持しています。原画像をローカル配置する際は、長辺800px程度へ変換し、`changes` に加工内容を記録します。CC BY-SA画像の改変物は同一または互換ライセンスで提供する必要があります。Commonsも、画像ごとにライセンスと作者を確認し、出典・ライセンス表示を行うよう案内しています。

## 主要な写真候補（原ページで確認済み）
| 都県 | 写真 | 作者 | ライセンス |
|---|---|---|---|
| 茨城 | Hitachi Seaside Park.jpg | Ohamberger | CC BY-SA 4.0 |
| 茨城 | Kasama Ware, Ibaraki 06.jpg | Σ64 | CC BY 4.0 |
| 栃木 | Kegon Falls.jpg | SEKIUCHI | CC BY-SA 3.0 |
| 群馬 | Kusatsu Yubatake.jpg | 百楽兎 | CC BY-SA 3.0 |
| 群馬 | Tomioka Silk Mill.JPG | 宮内省（現・宮内庁） | パブリックドメイン（日本） |
| 埼玉 | Kawagoe.jpg | Ocdp | CC BY-SA 3.0 |
| 埼玉 | ChichibuYomatsuri3.jpg | Fg2 | パブリックドメイン |
| 千葉 | Naritasan Shinshoji Temple.jpg | Manish Prabhune | CC BY 2.0 |
| 千葉 | Bocchi in Tako town, Chiba.jpg | On-chan | CC0 1.0 |
| 東京 | TokyoSkyTree.jpg | Douglas P. Perkins | CC BY 3.0 |
| 神奈川 | Minato Mirai.jpg | Akonnchiroll | CC BY-SA 4.0 |

## 確認・公開について
- 本番版の `index.html`、`app.js`、`style.css`、既存JSON、保存キーは変更していません。
- このブランチは未マージです。GitHub Pagesの本番URLにはまだ反映されません。
- PR内のコード確認後、試作ルートを本番へ反映するか判断します。
- 35項目の文章についても、全国展開前に公的出典との照合を行います。
