# 都道府県マスター

小学校中学年〜高学年向けの社会科学習アプリです。47都道府県について、次の3つを繰り返し学べます。

1. 地図上の位置
2. 県庁所在地
3. 地理・自然・歴史・文化・産業に関する代表的な特色

HTML / CSS / Vanilla JavaScriptだけで構成し、GitHub Pagesで動作します。実行時の外部API、APIキー、サーバー、データベースは使用しません。学習データと軽量化したGeoJSONはリポジトリ内に同梱しています。

## 学習モード

- 地図パズル：都道府県ポリゴンそのものをタップして回答。拡大・縮小・ドラッグ移動に対応し、同じチャレンジ中は表示範囲を保持
- 県庁所在地クイズ：県名から都市、都市から県名の双方向4択
- 地域の特色クイズ：地名・自然・文化、工芸・産業、食文化・特産物から、各都道府県4問・計188問の4択

出題範囲は、地方、東日本、西日本、全国から選択できます。地方区分は次の6区分に統一しています。

- 北海道・東北
- 関東
- 中部
- 近畿
- 中国・四国
- 九州・沖縄

東日本は「北海道・東北、関東、中部」、西日本は「近畿、中国・四国、九州・沖縄」です。

## 保存

`edu:todoufuken-master:*` の名前空間で、都道府県ごとの3分野の達成状況、音設定、20種類のバッジをlocalStorageに保存します。

## データと出典

- 行政区域：国土交通省「国土数値情報 行政区域データ（N03）」由来の `open-data-jp-prefectures-geojson` を教材用に軽量化
- 都道府県庁所在地：地方公共団体情報システム機構（J-LIS）「都道府県庁」
- 世界遺産・文化財：文化庁「世界遺産」
- 農林水産業：農林水産省および各地方農政局の都道府県概要
- 伝統的工芸品：経済産業省「伝統的工芸品」
- 地域の地理・産業：国土交通省および各都道府県公式サイト

特色問題は、年度で変動する順位を避け、問題文から正解が一意に定まる基本事項だけを収録しています。基本データは `data/prefectures.json`、追加問題は `data/feature-additions.json` に収録し、各問題の `source` は基本データ内の出典区分に対応します。

## 共通資産

- edu-components：`StorageManager`、`QuestionPool`、`BadgeManager`（読み込みに失敗した場合も学習を継続できるフォールバックあり）
- sounds-recipe-：`correct`、`softFail`、`badge`、`mission` 等の実在レシピ
- edu-effects：正誤演出用CSS
- edu-assets：社会科・共通バッジの軽量WebP
- navi-character-：通常版の軽量WebP（ファンタジー版は不使用）

## ローカル確認

ES ModulesとJSON読み込みを使うため、ローカルではHTTPサーバーから開きます。

```bash
python3 -m http.server 8000
```

その後 `http://localhost:8000/` を開きます。

## ライセンス・利用について

学校・家庭での学習目的で無料で利用できます。

このリポジトリのコードおよびTT-senseiオリジナルの教材・画像を、許可なく有料教材、有料サービス、販売商品として利用することはできません。アプリを複製して別サービスとして販売すること、オリジナル素材を素材集として再配布・販売することも許可していません。

行政区域データ、地図データ、その他の第三者データ・ライブラリ等には、それぞれの権利者・ライセンス・利用条件が適用されます。詳細は `THIRD_PARTY_NOTICES.md` を参照してください。

Software code and original educational content in this repository are licensed under the PolyForm Noncommercial License 1.0.0.

https://polyformproject.org/licenses/noncommercial/1.0.0/

Copyright © 2026 TT-sensei.
