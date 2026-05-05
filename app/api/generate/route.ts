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
      thumbTexts,
      selectedThumbNo,
      impressions,
      selectedImpressionNo,
      eyeCatches,
      selectedEyecatchNo,
      backgrounds,
      selectedBackgroundNo,
      finalImagePrompt,
      selectedLayout,
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
    } else if (mode === "generate-blog") {
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
      あなたは天才コピーライター兼アートディレクターです。以下の「ブログ記事」を主軸にしたサムネイル画像を制作するための【4つのデザイン要素】を、記事の内容とターゲットに合わせてそれぞれ10案ずつ作成してください。
      
      【ブログ記事】: ${blogResult}

      【出力ルール】
      必ず以下の区切り文字「===SPLIT===」を挟んで、4つのカテゴリーを順番に出力してください。各カテゴリーは必ず№1〜№10まで作成してください。

      (1. サムネイル用テキスト：メイン13字以内、サブ20字以内)
      №1 メイン:〇〇 サブ:〇〇
      ...
      ===SPLIT===
      (2. 画像の印象：記事のターゲット層に刺さるトーン＆マナー。例：プロフェッショナルで知的、温かみのある親しみやすさ、未来的なデジタル感など)
      №1 〇〇
      ...
      ===SPLIT===
      (3. アイキャッチ画像：具体的な被写体の人物像、年齢層、表情、情景、または象徴的なアイテムなど)
      №1 〇〇
      ...
      ===SPLIT===
      (4. 背景画像：記事テーマに合った具体的な背景の描写。例：明るいカフェ、抽象的なグリッド線、パステルカラーの幾何学模様など)
      №1 〇〇
      ...
      
      ${strictRules}`;
    } else if (mode === "generate-image-prompt") {
      const layouts = [
        "1. 左右分割レイアウト (Split Layout) / split screen layout, portrait on left, text on right, clean separation, balanced composition.",
        "2. 三分割構図 (Rule of Thirds) / rule of thirds, subject positioned off-center, golden ratio, dynamic balance.",
        "3. サンドイッチレイアウト (Sandwich Layout) / horizontal banner layers, top and bottom text bars, central focal image, structured hierarchy.",
        "4. 日の丸構図 (Central/Bullseye Composition) / centered composition, symmetrical layout, bullseye framing, focused attention.",
        "5. Zの法則レイアウト (Z-Pattern Layout) / Z-pattern visual flow, headline at top-left, call-to-action at bottom-right, scannable design.",
        "6. 放射線・集中線構図 (Radial/Action Lines) / radial perspective, action lines pointing to center, dynamic motion, explosive energy.",
        "7. オーバーラップレイアウト (Overlap/Layered Layout) / overlapping elements, 3D depth, text behind person, layered graphic design.",
        "8. 余白重視レイアウト (Minimalist/Negative Space) / minimalist design, generous negative space, clean and elegant, asymmetrical white space.",
        "9. グリッドレイアウト (Grid/Modular Layout) / grid system, modular layout, multiple frames, organized information tiles.",
        "10. 斜め・対角線構図 (Diagonal Composition) / diagonal alignment, slanted perspective, dynamic tension, oblique lines.",
        "11. 超高密度・オーバーラップ (High Density & Overlap) / text spans full width, elements densely packed, eye-catch and text overlapping significantly, bold and dynamic impact.",
      ];
      const layoutInstruction = selectedLayout
        ? layouts[parseInt(selectedLayout) - 1]
        : layouts[0];

      prompt = `
      あなたはプロのプロンプトエンジニアです。以下のユーザー指定情報を元に、画像生成AI用のプロンプトとSNS投稿文を作成してください。
      
      【ユーザーが指定した採用案】
      - テキスト案: リストの中から「№${selectedThumbNo}」を採用。
        リスト: \n${thumbTexts}
      - 印象案: リストの中から「№${selectedImpressionNo}」を採用。
        リスト: \n${impressions}
      - アイキャッチ案: リストの中から「№${selectedEyecatchNo}」を採用。
        リスト: \n${eyeCatches}
      - 背景画像案: リストの中から「№${selectedBackgroundNo}」を採用。
        リスト: \n${backgrounds}

      記事内容: ${blogResult}

      【作成物1：画像生成プロンプト】
      以下のフォーマットの { } で囲まれた部分を、上記の【ユーザーが指定した採用案】に沿って適切に英訳・補完し、完成版のプロンプト（英語）を作成してください。
      
      ※【超重要】タイポグラフィー（画像に挿入する文字）は絶対に英訳せず、元の「日本語」のまま記載してください。
      ※【超重要】人物を配置する場合、特に指定がない限り必ず「日本人（Japanese）」として英文プロンプトに組み込んでください。

      # 指示:
      - 以下の「記事」を理解し、Nano Banana Proを使用して記事のサムネイル画像を作成してください。
      # 仕様:
      - 水平画像
      - アスペクト比: 16:9
      # 印象:
      - { 採用した「印象案」のトーン＆マナーを反映する }
      - プロフェッショナルなデザイナー品質
      - 創造的なタイポグラフィ
      # アイキャッチ画像:
      - { 採用した「アイキャッチ案」の情景や被写体を詳細に反映する。人物がいる場合は必ず "Japanese" と記載する }
      # タイポグラフィー:
      - { 採用した「テキスト案」を元に7~13文字で記載。絶対に英訳せず、日本語のまま記載すること }
      - 「タイトル」と全く同じは禁止
      - 視認性が高いフォントを使用
      - 文字サイズのコントラストを高く
      - 意味を考慮した改行位置
      - 最も目立たせたい文字は四角の帯を敷く
      - 文字の一部だけを斜体にする
      - 大文字・小文字は「テーマ」から変えない
      # 背景画像:
      - { 採用した「背景画像案」を詳細に反映する }
      - タイポグラフィーの視認性が最優先（テキストが埋もれないようにする）
      # 配色:
      - ベースカラー70%: { 指定された印象案・背景案に最適な色を提案 }
      - メインカラー25%: { 最適な色を提案 }
      - アクセントカラー5%: { メインカラーの補色を提案 }
      - コントラスト: 高い、パキッとした印象
      - 使用できる色数: 2~3色まで
      - 彩度が高い、鮮やか
      # レイアウト:
      - 以下の指定されたレイアウトパターンを必ず使用し、その英語のプロンプト要素を記載してください。
      - 一瞬で目を引く
      - 上下左右に80xpの余白を設ける
      
      # 指定レイアウトパターン:
      ${layoutInstruction}

      # 記事:
      - { 記事の要約と、ターゲットが抱える本音の悩みを記載 }

      【作成物2：SNS投稿用テキスト】
      作成したブログ記事を宣伝するためのTwitter用投稿文（140字以内、ハッシュタグ付き）。

      【出力形式】
      必ず以下の区切り文字「===SPLIT===」を挟んで、作成物1と作成物2のテキストのみを出力してください。

      (作成物1：完成した画像生成プロンプトのテキスト)
      ===SPLIT===
      (作成物2：SNS投稿用のテキスト)
      ${strictRules}
      `;
    } else if (mode === "generate-section-images") {
      prompt = `
      あなたはブランド専属のトップ・アートディレクターです。
      提供された【ブログ記事】の中から「h2見出し（【】や■で囲まれた主要な見出し）」をすべて特定し、各セクションの内容を象徴する「見出し画像（挿絵）用プロンプト」を、見出しの数だけ作成してください。
      あなたの最優先事項は「メインサムネイル画像との完璧なデザイン統一」です。

      【ブログ記事】: ${blogResult}
      
      【メインサムネイル画像の英文プロンプト（デザインの基準）】:
      ${finalImagePrompt}

      【出力・デザインの絶対的なルール】
      1. 分析と継承（絶対厳守）:
         あなたは、上記の【メインサムネイル画像の英文プロンプト】を深く分析し、そこに記述されている「具体的な配色（Color palette）」「フォントのスタイル（Font style）」「全体のトーン（Tone/Impression）」を正確に抽出してください。
         生成する見出し画像は、抽出した配色、フォント、トーンを【完全に同じ】にし、一連のブランド・シリーズに見えるようにしてください。プロンプトには具体的な色名やフォントスタイルを明記してください。

      2. 構成の独自性（自由）:
         各見出しの「内容」を象徴する具体的な被写体、情景、構図、レイアウト、背景描写は、自由に、かつセクションの内容に合わせて独自に考案してください。アイキャッチ画像の構図や背景をコピーしないでください。
         ※人物を登場させる場合は、必ず「日本人（Japanese）」と指定してください。

      3. サムネイル化の禁止と【日本語文字の死守】（絶対厳守）:
         レイアウトや文字組、アイキャッチ画像等は自由ですが、巨大な文字配置や、サムネイルのような「文字が主役の画像」にしてはいけません。文字（見出しタイトルを短くしたもの）を入れる場合は、邪魔にならない自然なサイズで控えめに配置してください。
         ※【超重要】配置する文字は【絶対に英訳せず、日本語のまま】プロンプトに組み込んでください。ローマ字（Romaji）や英語訳を併記することは【厳禁】です。
         ※英文プロンプト内には必ず、以下のような強力な制約を含めて出力してください。
         例: The text "〇〇〇" is written in Japanese. No Romaji, No English translations.

      - 出力形式（英文プロンプトを生成）：
        ■見出し：[見出しの名称]
        プロンプト：[英文プロンプト]
        （次の見出しへ...）

      ${strictRules}`;
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
