# 都道府県マスター：県図鑑プロトタイプ（全国47都道府県）

本番版とは分離した試作ルートです。既存のクイズ、地図、MASTER条件、localStorageの保存キーには触れていません。

## 現在の試作内容
- 全国47都道府県を8地方に分けて表示・切り替え
- 5カテゴリ×47都道府県＝235項目のデータ構造
- 全235項目の具体的な説明文（5カテゴリ各47件）
- 各項目の短い説明
- 全235項目に公的機関・自治体などの調査用参考リンクを表示
- 写真カードと写真選定中カードの表示
- 写真ごとの作者・ライセンス・加工状態・Commons原ページ表示
- 写真の作者・ライセンス・出典を一覧できる `PHOTO-CREDITS.md` を追加
- タブレット／スマートフォン向けレイアウト
- 全国47都道府県の項目を県名・県庁所在地・地方名・項目名・カテゴリ・説明文から横断検索
- 235項目すべてに、カテゴリに応じた調べる視点・問いを表示
- 23項目の説明文を追加改稿し、地域の自然・歴史・産業の具体的な説明を補強
- 検索範囲を全国47都道府県に拡張し、県別に検索結果をまとめて表示
- 写真の読み込みに失敗した場合の代替表示
- Wikimedia Commonsの原ページで対象物・作者・ライセンス情報を確認した写真候補を102点登録（47都道府県すべてに1点以上）。写真未選定は133項目
- 図鑑の閲覧はMASTER条件に影響しない

## 全国データの進捗
- 47都道府県、8地方、235項目を登録
- 全国235項目の説明文を具体化。自然・風景、名所・建物、食べ物・特産、文化・まつり、産業・工芸の5カテゴリを各47件登録
- 46項目は自治体・施設・観光協会などの個別資料、189項目は調査に使える公的な分野別資料へ接続
- 235項目すべてに参考資料リンクを登録。資料は調査の入口であり、各説明文の全記述を個別に照合済みという意味ではない
- 環境省・文化庁・農林水産省・経済産業省の公的資料を活用
- 地方区分は小学校社会科で扱いやすい8地方区分（北海道・東北・関東・中部・近畿・中国・四国・九州沖縄）

## 調べ学習の仕組み
- 各項目に「調べる視点」を追加。自然・名所・食・文化・工芸のカテゴリごとに問いを用意
- 「自分の住む地域や、ほかの都道府県と比べてみよう」と促し、情報を読むだけで終わらない設計
- 参考資料リンクには、そのページで確認できる内容を短く添えている

## 写真の進捗
- 写真候補：102点 / 全国235項目
- 写真候補がある都道府県：47/47（全都道府県に1点以上）
- カテゴリ別：自然・風景 28点、産業・工芸 15点、名所・建物 30点、文化・まつり 14点、食べ物・特産 15点
- ライセンス別：CC BY-SA 4.0 24点、CC BY 2.0 7点、CC BY 3.0 8点、CC BY 4.0 4点、CC BY-SA 3.0 35点、パブリックドメイン（日本） 2点、パブリックドメイン（作者による公開） 10点、CC0 1.0 6点、CC BY-SA 2.0 6点nsのSpecial:FilePathを参照する確認用表示。ローカルWebP化・オフライン対応は未実施
- 写真メタデータにはファイル名、作者、ライセンス、ライセンスURL、原ページ、加工状態、確認状態を登録
- すべての写真について、公開前に対象物との一致・作者表記・ライセンス条件・原ページを再確認すること

写真の出典・作者・ライセンスは `data/prefecture-gallery.json` と `PHOTO-CREDITS.md` に項目単位で保持しています。画像をローカル配置する際は、元ファイルを保存し、リサイズ・変換などの加工内容を `changes` に記録します。CC BY-SA画像の改変物は同一または互換ライセンスで提供する必要があります。

## 今回追加した写真候補
| 都道府県 | 項目 | ファイル | 作者 | ライセンス |
|---|---|---|---|---|
| 茨城県 | 偕楽園 | [Kairakuen Mito.jpg](https://commons.wikimedia.org/wiki/File:Kairakuen_Mito.jpg) | Lukas from Munich, Germany | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| 北海道 | 函館山 | [Aerial view of Hakodate at night.jpg](https://commons.wikimedia.org/wiki/File:Aerial_view_of_Hakodate_at_night.jpg) | Fumikas Sagisavas | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| 群馬県 | 高崎だるま | [Small collection of Daruma dolls - Takasaki - August 2014.jpg](https://commons.wikimedia.org/wiki/File:Small_collection_of_Daruma_dolls_-_Takasaki_-_August_2014.jpg) | nesnad | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| 千葉県 | 佐原の大祭 | [Sawara festival in Autumn,Katori-city,Japan.jpg](https://commons.wikimedia.org/wiki/File:Sawara_festival_in_Autumn,Katori-city,Japan.jpg) | katorisi | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| 栃木県 | 益子焼 | [MashikoDaiseiGama202410.jpg](https://commons.wikimedia.org/wiki/File:MashikoDaiseiGama202410.jpg) | FukuroWaraw | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

## 追加写真候補（今回）
| 都道府県 | 項目 | ファイル | 作者 | ライセンス |
|---|---|---|---|---|
| 滋賀県 | 彦根城 | [Hikone Castle château.jpg](https://commons.wikimedia.org/wiki/File:Hikone_Castle_château.jpg) | Hyppolyte de Saint-Rambert | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| 三重県 | 伊勢うどん | [Ise udon by hirotomo.jpg](https://commons.wikimedia.org/wiki/File:Ise_udon_by_hirotomo.jpg) | hirotomo | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |

## 追加写真候補（今回）
| 都道府県 | 項目 | ファイル | 作者 | ライセンス |
|---|---|---|---|---|
| 茨城県 | ほしいも | [Hoshi-imo.JPG](https://commons.wikimedia.org/wiki/File:Hoshi-imo.JPG) | Papakuro | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| 神奈川県 | 鎌倉彫 | [KamakuraBori.jpg](https://commons.wikimedia.org/wiki/File:KamakuraBori.jpg) | Pqks758 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| 石川県 | 輪島塗 | [Wajimanurie.JPG](https://commons.wikimedia.org/wiki/File:Wajimanurie.JPG) | fitm | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| 福井県 | 三国祭 | [Mikuni festival 2022.jpg](https://commons.wikimedia.org/wiki/File:Mikuni_festival_2022.jpg) | 藤谷良秀 (Yoshihide Fujitani) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

## 関東の写真候補（原ページで確認済み）
| 都県 | 写真 | 作者 | ライセンス |
|---|---|---|---|
| 茨城 | Hitachi Seaside Park.jpg | Ohamberger | CC BY-SA 4.0 |
| 栃木 | Nikko toshogu shrine.jpg | Koichi Sato | CC BY-SA 4.0 |
| 埼玉 | Nagatoro Iwadatami.JPG | NY066（Wikivoyage共有） | CC BY-SA 3.0 |
| 千葉 | Kujukuri Beach.jpg | 作者情報なし（PD公開者：Beroccstar） | パブリックドメイン |
| 東京 | Ogasawara Islands, Tokyo, Japan.jpg | Anagounagi | CC BY-SA 4.0 |
| 神奈川 | A view of Lake Ashi, Hakone, Japan.jpg | Joli Rumi | CC BY-SA 4.0 |
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
- 235項目の文章について、公的出典との照合を継続します。
