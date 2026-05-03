import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("APIキーが見つかりません。");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const body = await req.json();
    const {
      mode,
      serviceUrl,
      serviceContent,
      selectedIdeaNo,
      ideasList,
      blogResult,
      strongTitlesList,
      selectedStrongTitleNo,
      thumbOptionsList,
      selectedThumbNo,
    } = body;

    let prompt = "";
    const strictRules = `
    【厳守ルール】
    - アスタリスク（* や **）などのマークダウン記号は絶対に使用しないでください。
    - 「※」や「#」などの記号も禁止します。
    - 【Point】【Reason】【Example】【キラーインサイト】といった「構成用のラベル」は一切出力しないでください。これらは読者には不要です。
    - 見出しは「【】」や「■」を使用し、自然な文章の流れで作成してください。
    - そのままブログにコピペして使えるプレーンテキスト形式で出力してください。
    `;

    if (mode === "suggest-ideas") {
      prompt = `あなたは一流のWEBマーケターです。以下のサービス情報を分析し、集客用の悩み解決記事テーマを10セット提案してください。
      URL: ${serviceUrl} / 内容: ${serviceContent}
      形式：№1 テーマ：... ターゲット：...
      ${strictRules}`;
    } else if (mode === "generate-blog") {
      prompt = `
      あなたは、その道の専門家としてブログを執筆するプロ編集長です。
      以下の案（№${selectedIdeaNo}）に基づき、2500字程度のブログを執筆してください。
      
      案リスト: ${ideasList}
      提供サービス詳細: ${serviceContent}
      
      【執筆の最重要スタンス】
      - 「私（筆者）」の目線で書いてください。
      - 第三者がサービスを紹介するような書き方（「亀井氏は〜」「理想のパートナーをご紹介します」等）は【絶対禁止】です。
      - 読者の悩みに対して「専門家としての知見」を惜しみなく提供し、まずは記事単体で「この記事を読んでよかった！」と価値を感じてもらうことに全力を注いでください。
      - 読者がやり方はわかったけれど「自分一人で完結させるのは大変そうだ」「プロに任せたほうが確実だ」と感じるような、具体的で深い解説を行ってください。

      【構成】
      1. 共感と問題提起：読者が今抱えている痛みや、陥りがちな間違いを指摘する。
      2. 専門的インサイト：巷の表面的な情報ではない、プロならではの視点で解決策を解説する。
      3. 具体的なステップ：どうすれば解決できるかの道筋を示す。
      4. サービスへの架け橋：解説した内容を「より確実に、最短で実現したい方」に向けて、自分のサービス（URL：${serviceUrl}）を解決の手段として優しく提案する。

      【CTAの指示】
      記事の最後に、押し売りではなく「あなたのパートナーとして伴走します」という姿勢で、URLへの強烈な誘導コピーライティングとともに記載を行ってください。
      ${strictRules}`;
    } else if (mode === "generate-strong-titles") {
      prompt = `
      # 指示
      提供された【ブログ記事の内容】を読み込み、指定された【NOPE型メソッド・タイトル作成の4原則】に従って、読者が思わずクリックせずにはいられないブログタイトルを5つ生成してください。

      # 役割
      人間の深層心理と裏の欲望を熟知した、トップクラスのプロフェッショナル・コピーライター

      # NOPE型メソッド・タイトル作成の4原則
      1. 【裏の欲望の肯定】（泥臭い本音を刺激）
      2. 【「知識」ではなく「許可」を売る】（言い訳や免罪符を与える）
      3. 【きれいすぎる言葉の排除】（生々しい言葉を使用）
      4. 【小さくても深く刺す】（解像度の高い言葉）

      # 入力情報
      【ブログ記事の内容】: ${blogResult}

      # 出力形式
      №1 【タイトル案】
      ・満たしている裏の欲望：...
      ・与えている許可・言い訳：...
      (№5まで作成)
      ${strictRules}
      `;
    } else if (mode === "suggest-thumbnails") {
      prompt = `
      あなたは天才コピーライターです。以下の「最強タイトル」を主軸にしたサムネイル用テキストを10案作成してください。
      【最強タイトル案リスト】: ${strongTitlesList}の中から「№${selectedStrongTitleNo}」を採用。
      【記事要約】: ${blogResult}
      ${strictRules}`;
    } else if (mode === "generate-image-prompt") {
      prompt = `
      あなたはプロのプロンプトエンジニアです。以下の情報を元に、画像生成AI用のプロンプトとSNS投稿文を作成してください。
      
      【前提条件】
      サムネイルテキスト案リストから「№${selectedThumbNo}」を採用。
      最強タイトル案リストから「№${selectedStrongTitleNo}」を採用。
      記事内容: ${blogResult}

      【作成物1：画像生成プロンプト】
      以下のフォーマットの { } で囲まれた部分を、記事内容やターゲットに合わせて具体的に埋め、完成版のプロンプトを作成してください。（レイアウトパターンは参考例から最適なものを1つ選んで記載してください）

      # 指示:
      - 以下の「記事」を理解し、Nano Banana Proを使用して記事のサムネイル画像を作成してください。
      # 仕様:
      - 水平画像
      - アスペクト比: 16:9
      # 印象:
      - ビジネスパーソンにアピールする知的でスタイリッシュなデザイン
      - プロフェッショナルなデザイナー品質
      - 創造的なタイポグラフィ
      # アイキャッチ画像:
      - { 具体的な被写体や情景描写を提案してください }
      - 強い意図がなければ人物（20〜30代、日本人）を入れる
      # タイポグラフィー:
      - { 採用したサムネイルテキストを参考に7~13文字で記載 }
      - 「タイトル」と全く同じは禁止
      - 視認性が高いフォントを使用
      - 文字サイズのコントラストを高く
      - 意味を考慮した改行位置
      - 最も目立たせたい文字は四角の帯を敷く
      - 文字の一部だけを斜体にする
      - 大文字・小文字は「テーマ」から変えない
      # 背景画像:
      - { 具体的な背景の描写を提案してください }
      - タイポグラフィーの視認性が優先
      - 抽象的なデザイン要素を配置し、デジタル感を演出
      # 配色:
      - ベースカラー70%: { 色を提案 }
      - メインカラー25%: { 色を提案 }
      - アクセントカラー5%: { メインカラーの補色を提案 }
      - コントラスト: 高い、パキッとした印象
      - 使用できる色数: 2~3色まで
      - 彩度が高い、鮮やか
      # レイアウト:
      - { 以下の「レイアウトパターン参考例」から最適なものを1つ選び、その名前と英語のプロンプト要素を記載してください }
      - 一瞬で目を引く
      - 上下左右に80xpの余白を設ける
      
      # レイアウトパターン参考例:
      1. 左右分割レイアウト (Split Layout) / split screen layout, portrait on left, text on right, clean separation, balanced composition.
      2. 三分割構図 (Rule of Thirds) / rule of thirds, subject positioned off-center, golden ratio, dynamic balance.
      3. サンドイッチレイアウト (Sandwich Layout) / horizontal banner layers, top and bottom text bars, central focal image, structured hierarchy.
      4. 日の丸構図 (Central/Bullseye Composition) / centered composition, symmetrical layout, bullseye framing, focused attention.
      5. Zの法則レイアウト (Z-Pattern Layout) / Z-pattern visual flow, headline at top-left, call-to-action at bottom-right, scannable design.
      6. 放射線・集中線構図 (Radial/Action Lines) / radial perspective, action lines pointing to center, dynamic motion, explosive energy.
      7. オーバーラップレイアウト (Overlap/Layered Layout) / overlapping elements, 3D depth, text behind person, layered graphic design.
      8. 余白重視レイアウト (Minimalist/Negative Space) / minimalist design, generous negative space, clean and elegant, asymmetrical white space.
      9. グリッドレイアウト (Grid/Modular Layout) / grid system, modular layout, multiple frames, organized information tiles.
      10. 斜め・対角線構図 (Diagonal Composition) / diagonal alignment, slanted perspective, dynamic tension, oblique lines.

      # 記事:
      - { 記事の要約と、ターゲットが抱える本音の悩みを記載 }

      【作成物2：SNS投稿用テキスト】
      作成したブログ記事を宣伝するためのTwitter用投稿文（140字以内、ハッシュタグ付き）。

      【出力形式】
      必ず以下の区切り文字「===SPLIT===」を挟んで、作成物1と作成物2のテキストのみを出力してください。（見出し等の装飾は一切不要です）

      (作成物1：完成した画像生成プロンプトのテキスト)
      ===SPLIT===
      (作成物2：SNS投稿用のテキスト)
      ${strictRules}
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ? response.text.replace(/\*/g, "") : "";
    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("API通信エラー詳細:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
