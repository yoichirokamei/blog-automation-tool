"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [serviceUrl, setServiceUrl] = useState("");
  const [serviceContent, setServiceContent] = useState("");
  const [ideas, setIdeas] = useState("");
  const [selectedIdeaNo, setSelectedIdeaNo] = useState("1");
  const [blogResult, setBlogResult] = useState("");

  // ▼ 4つのオプションリスト用ステート
  const [thumbTexts, setThumbTexts] = useState("");
  const [impressions, setImpressions] = useState("");
  const [eyeCatches, setEyeCatches] = useState("");
  const [backgrounds, setBackgrounds] = useState("");

  // ▼ それぞれの選択番号用ステート
  const [selectedThumbNo, setSelectedThumbNo] = useState("1");
  const [selectedImpressionNo, setSelectedImpressionNo] = useState("1");
  const [selectedEyecatchNo, setSelectedEyecatchNo] = useState("1");
  const [selectedBackgroundNo, setSelectedBackgroundNo] = useState("1");

  const [selectedLayout, setSelectedLayout] = useState("1");
  const [finalResult, setFinalResult] = useState("");
  const [sectionImages, setSectionImages] = useState("");

  const callApi = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      return resData.result;
    } catch (e) {
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const finalImagePrompt =
    finalResult.split("===SPLIT===")[0]?.trim() || finalResult;
  const finalSnsPost =
    finalResult.split("===SPLIT===")[1]?.trim() || "生成に失敗しました。";

  return (
    <div className="min-h-screen bg-pink-50 p-6 md:p-12 font-sans text-slate-800 text-[16px]">
      <div className="max-w-5xl mx-auto space-y-8">
        {step < 6 && (
          <div className="text-center mb-8">
            <img
              src="/dokidoki-logo.png"
              alt="ドキドキライター"
              className="mx-auto h-24 object-contain drop-shadow-md"
            />
            <p className="text-pink-600 font-bold mt-4 tracking-wider">
              悩み解決から自然に売れる魔法のツール 🪄
            </p>
          </div>
        )}

        {/* STEP 1: 入力 */}
        {step === 1 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-2xl font-extrabold">
                ① サービス情報を入力
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <Input
                placeholder="ココナラ出品URL"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                className="border-pink-200"
              />
              <Textarea
                placeholder="サービス説明を貼り付け"
                className="h-48 border-pink-200"
                value={serviceContent}
                onChange={(e) => setServiceContent(e.target.value)}
              />
              <Button
                className="w-full h-14 text-lg font-bold bg-pink-500 hover:bg-pink-600 shadow-md rounded-full text-white"
                onClick={async () => {
                  const res = await callApi({
                    mode: "suggest-ideas",
                    serviceUrl,
                    serviceContent,
                  });
                  setIdeas(res);
                  setStep(2);
                }}
                disabled={loading}
              >
                {loading ? "🎀 分析中..." : "記事テーマを10個提案してもらう ✨"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: テーマ選択 */}
        {step === 2 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-2xl font-extrabold">
                ② テーマを選んでください
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="bg-white p-4 rounded text-sm whitespace-pre-wrap h-80 overflow-y-auto border border-pink-100">
                {ideas}
              </div>
              <select
                className="w-full p-3 border-2 border-pink-200 rounded-md bg-white font-bold"
                value={selectedIdeaNo}
                onChange={(e) => setSelectedIdeaNo(e.target.value)}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    №{i + 1}
                  </option>
                ))}
              </select>
              <Button
                className="w-full h-14 text-lg font-bold bg-pink-500 hover:bg-pink-600 rounded-full text-white"
                onClick={async () => {
                  const res = await callApi({
                    mode: "generate-blog",
                    selectedIdeaNo,
                    ideasList: ideas,
                    serviceUrl,
                    serviceContent,
                  });
                  setBlogResult(res);
                  setStep(3);
                }}
                disabled={loading}
              >
                {loading ? "✍️ 執筆中..." : "この記事を生成する 🚀"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: 記事確認 & サムネ4要素案作成 */}
        {step === 3 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-2xl font-extrabold">
                ③ 記事完成！次にデザイン要素を作ります
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="bg-white p-4 rounded text-sm whitespace-pre-wrap h-80 overflow-y-auto border border-pink-100 leading-relaxed">
                {blogResult}
              </div>
              <Button
                className="w-full h-14 text-lg font-bold bg-pink-500 hover:bg-pink-600 rounded-full shadow-lg text-white"
                onClick={async () => {
                  const res = await callApi({
                    mode: "suggest-thumbnails",
                    blogResult,
                  });
                  // 4つの要素に分割して格納
                  const parts = res.split("===SPLIT===");
                  setThumbTexts(parts[0]?.trim() || "");
                  setImpressions(parts[1]?.trim() || "");
                  setEyeCatches(parts[2]?.trim() || "");
                  setBackgrounds(parts[3]?.trim() || "");
                  setStep(4);
                }}
                disabled={loading}
              >
                {loading
                  ? "🎨 考案中..."
                  : "サムネ用のデザイン案を大量生成する 💥"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: 4要素＆レイアウトのフルカスタマイズ選択 */}
        {step === 4 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-2xl font-extrabold">
                ④ デザインをフルカスタマイズ！
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. テキスト */}
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <label className="font-bold text-pink-800 block mb-2">
                    1. テキスト案
                  </label>
                  <div className="bg-white p-3 rounded text-xs whitespace-pre-wrap h-40 overflow-y-auto border mb-3">
                    {thumbTexts}
                  </div>
                  <select
                    className="w-full p-2 border border-pink-300 rounded font-bold"
                    value={selectedThumbNo}
                    onChange={(e) => setSelectedThumbNo(e.target.value)}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        テキスト №{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. 印象 */}
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <label className="font-bold text-pink-800 block mb-2">
                    2. 全体の印象
                  </label>
                  <div className="bg-white p-3 rounded text-xs whitespace-pre-wrap h-40 overflow-y-auto border mb-3">
                    {impressions}
                  </div>
                  <select
                    className="w-full p-2 border border-pink-300 rounded font-bold"
                    value={selectedImpressionNo}
                    onChange={(e) => setSelectedImpressionNo(e.target.value)}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        印象 №{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. アイキャッチ */}
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <label className="font-bold text-pink-800 block mb-2">
                    3. アイキャッチ（被写体）
                  </label>
                  <div className="bg-white p-3 rounded text-xs whitespace-pre-wrap h-40 overflow-y-auto border mb-3">
                    {eyeCatches}
                  </div>
                  <select
                    className="w-full p-2 border border-pink-300 rounded font-bold"
                    value={selectedEyecatchNo}
                    onChange={(e) => setSelectedEyecatchNo(e.target.value)}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        被写体 №{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. 背景 */}
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <label className="font-bold text-pink-800 block mb-2">
                    4. 背景画像
                  </label>
                  <div className="bg-white p-3 rounded text-xs whitespace-pre-wrap h-40 overflow-y-auto border mb-3">
                    {backgrounds}
                  </div>
                  <select
                    className="w-full p-2 border border-pink-300 rounded font-bold"
                    value={selectedBackgroundNo}
                    onChange={(e) => setSelectedBackgroundNo(e.target.value)}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        背景 №{i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5. レイアウト */}
              <div className="bg-pink-100 p-5 rounded-lg border-2 border-pink-300">
                <label className="font-bold text-pink-900 block mb-2 text-lg">
                  5. アイキャッチ画像のレイアウト
                </label>
                <select
                  className="w-full p-3 border-2 border-pink-400 rounded-md bg-white font-bold"
                  value={selectedLayout}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                >
                  <option value="1">1. 左右分割レイアウト</option>
                  <option value="2">2. 三分割構図</option>
                  <option value="3">3. サンドイッチレイアウト</option>
                  <option value="4">4. 日の丸構図</option>
                  <option value="5">5. Zの法則レイアウト</option>
                  <option value="6">6. 放射線・集中線構図</option>
                  <option value="7">7. オーバーラップレイアウト</option>
                  <option value="8">8. 余白重視レイアウト</option>
                  <option value="9">9. グリッドレイアウト</option>
                  <option value="10">10. 斜め・対角線構図</option>
                  <option value="11">11. 超高密度・オーバーラップ</option>
                </select>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold bg-pink-500 hover:bg-pink-600 rounded-full text-white"
                onClick={async () => {
                  const res = await callApi({
                    mode: "generate-image-prompt",
                    selectedThumbNo,
                    thumbTexts,
                    selectedImpressionNo,
                    impressions,
                    selectedEyecatchNo,
                    eyeCatches,
                    selectedBackgroundNo,
                    backgrounds,
                    selectedLayout,
                    blogResult,
                  });
                  setFinalResult(res);
                  setStep(5);
                }}
                disabled={loading}
              >
                {loading ? "🪄 処理中..." : "この組み合わせで確定する ✨"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 5: 分岐（見出し画像を作るかどうか） */}
        {step === 5 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-2xl font-extrabold text-center">
                ⑤ 全ての基本素材が揃いました！
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="text-center font-bold text-slate-600">
                さらに記事の品質を上げますか？
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  className="h-auto py-4 text-lg font-bold bg-pink-600 hover:bg-pink-700 rounded-2xl text-white shadow-lg whitespace-normal"
                  onClick={async () => {
                    const res = await callApi({
                      mode: "generate-section-images",
                      blogResult,
                      finalImagePrompt,
                    });
                    setSectionImages(res);
                    setStep(6);
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    "🪄 見出し画像を生成中..."
                  ) : (
                    <>
                      ① 見出しごとの画像用
                      <br />
                      プロンプトも作成する（推奨）
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 text-lg font-bold border-pink-300 text-pink-600 hover:bg-pink-50 rounded-2xl shadow-sm whitespace-normal"
                  onClick={() => setStep(6)}
                >
                  ② ここまでの
                  <br />
                  生成物を表示する
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 6: 最終まとめ画面 */}
        {step === 6 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <img
                src="/dokidoki-logo.png"
                alt="ドキドキライター"
                className="mx-auto h-20 object-contain drop-shadow-md"
              />
              <h2 className="text-3xl font-black text-pink-700 mt-4">
                完成素材まとめ
              </h2>
            </div>

            <Card className="shadow-lg border-pink-200 border-2">
              <CardHeader>
                <CardTitle className="text-pink-800 text-2xl font-extrabold">
                  ① ブログ記事（タイトル＋本文＋CTA）
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-white p-6 rounded text-sm whitespace-pre-wrap border border-pink-100 leading-relaxed">
                  {blogResult}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-pink-200 border-2">
              <CardHeader>
                <CardTitle className="text-pink-800 text-2xl font-extrabold">
                  ② アイキャッチ画像用プロンプト
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-slate-50 p-6 rounded text-sm whitespace-pre-wrap border border-pink-100">
                  {finalImagePrompt}
                </div>
              </CardContent>
            </Card>

            {/* 見出し画像があれば表示（追加特典） */}
            {sectionImages && (
              <Card className="shadow-lg border-pink-500 border-4">
                <CardHeader className="bg-pink-500">
                  <CardTitle className="text-white text-2xl font-extrabold">
                    ✨【追加特典】各見出し用の画像プロンプト
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-white p-6 rounded text-sm whitespace-pre-wrap border border-pink-200 leading-relaxed">
                    {sectionImages}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg border-pink-200 border-2">
              <CardHeader>
                <CardTitle className="text-pink-800 text-2xl font-extrabold">
                  ③ SNS投稿用テキスト
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-blue-50 p-6 rounded text-sm whitespace-pre-wrap border border-pink-100">
                  {finalSnsPost}
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-14 text-lg font-bold bg-slate-500 hover:bg-slate-600 rounded-full text-white shadow-md"
              onClick={() => {
                setStep(1);
                setServiceUrl("");
                setServiceContent("");
                setSectionImages("");
              }}
            >
              🔄 最初からやり直す
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
