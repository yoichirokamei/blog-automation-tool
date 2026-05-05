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
      thumbOptionsList,
      selectedThumbNo,
    } = body;

    let prompt = "";
    const strictRules = `
    【厳守ルール】
    - アスタリスク（* や **）などのマークダウン記号は絶対に使用しないでください。
    - 「※」や「#」などの記号も禁止します。
    - 【Point】【Reason】といった「構成用のラベル」は一切出力しないでください。
    - 見出しは「【】」や「■」を使用し、自然な文章の流れで作成してください。
    - そのままブログにコピペして使えるプレーンテキスト形式で出力してください。
    `;

    if (mode === "suggest-ideas") {
      prompt = `あなたは一流のWEBマーケターです。以下のサービス情報を分析し、集客用の悩み解決記事テーマを10セット提案してください。
      URL: ${serviceUrl} / 内容: ${serviceContent}
      形式：№1 テーマ：... ターゲット：...
      ${strictRules}`;
    }

    // ▼ 今回のメイン修正：売り込み感を排除し、悩み解決に特化した記事＋タイトル生成 ▼
    else if (mode === "generate-blog") {
      prompt = `
      あなたは、その道の専門家としてブログを執筆するプロ編集長です。
      以下の案（№${selectedIdeaNo}）に基づき、タイトルと2500字程度のブログ本文を執筆してください。
      
      案リスト: ${ideasList}
      提供サービス詳細: ${serviceContent}
      
      【執筆の最重要スタンス：売り込み感の排除】
      - ブログの最大の目的は「読者の悩み解決」です。タイトル、見出し、本文から「売り込み感（私のサービスを買って！というアピール）」を完全に排除してください。
      - タイトルは、読者が「この記事を読めば自分の悩みが解決しそう」と安心感・信頼感を持つものにしてください。過度な煽りやセールス臭は離脱に繋がるため厳禁です。
      - 読者の悩みに対して「専門家としての知見」を惜しみなく提供し、まずは記事単体で100%価値を感じてもらうことに全力を注いでください。
      - 「私（筆者）」の目線で書き、第三者目線での紹介は禁止です。

      【構成】
      [タイトル] 読者の悩みを解決する、信頼感のある魅力的なタイトル
      1. 共感と問題提起：読者が今抱えている痛みや間違いを指摘する。
      2. 専門的インサイト：表面的な情報ではない、プロならではの解決策を解説する。
      3. 具体的なステップ：どうすれば解決できるかの道筋を示す。
      4. サービスへの架け橋（ここでのみサービスに言及）：記事の最後まで読んで初めて「自分一人でやるよりプロに頼むのもありだな」と思わせる自然な流れを作ります。

      【CTAの指示】
      記事の最後の最後にのみ、「もし一人で進めるのが不安なら、私が伴走しますよ」という優しく寄り添う姿勢で、以下のURLへの誘導を行ってください。
      【サービスURL】: ${serviceUrl}
      
      【出力フォーマット】
      1行目に「【タイトル】〇〇〇」と記載し、改行して本文を続けてください。
      ${strictRules}`;
    } else if (mode === "suggest-thumbnails") {
      prompt = `
      あなたは天才コピーライターです。以下の「ブログ記事」を主軸にしたサムネイル用テキストを10案作成してください。
      
      【ブログ記事】: ${blogResult}

      メインコピー(13字以内)とサブコピー(20字以内)をセットにして№1〜10まで作成。
      ${strictRules}`;
    } else if (mode === "generate-image-prompt") {
      prompt = `
      あなたはプロのプロンプトエンジニアです。以下の情報を元に、画像生成AI用のプロンプトとSNS投稿文を作成してください。
      
      【前提条件】
      サムネイルテキスト案リストから「№${selectedThumbNo}」を採用。
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
