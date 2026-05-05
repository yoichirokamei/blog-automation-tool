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
  const [thumbOptions, setThumbOptions] = useState("");
  const [selectedThumbNo, setSelectedThumbNo] = useState("1");
  const [finalResult, setFinalResult] = useState("");

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
    <div className="min-h-screen bg-pink-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
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

        {/* STEP 1: サービス入力 */}
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

        {/* STEP 2: テーマ選択 -> ブログ作成（タイトル含む） */}
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
              <label className="font-bold text-pink-800 block">
                採用するナンバー：
              </label>
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
                {loading
                  ? "✍️ 悩み解決記事を執筆中..."
                  : "この記事を生成する 🚀"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: 記事確認 -> サムネ用コピーへ */}
        {step === 3 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-2xl font-extrabold">
                ③ 記事完成！次はサムネ用テキストです
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="bg-white p-4 rounded text-sm whitespace-pre-wrap h-80 overflow-y-auto border border-pink-100">
                {blogResult}
              </div>
              <Button
                className="w-full h-14 text-lg font-bold bg-pink-500 hover:bg-pink-600 rounded-full shadow-lg text-white"
                onClick={async () => {
                  const res = await callApi({
                    mode: "suggest-thumbnails",
                    blogResult,
                  });
                  setThumbOptions(res);
                  setStep(4);
                }}
                disabled={loading}
              >
                {loading
                  ? "🎨 サムネ用コピー作成中..."
                  : "サムネイル用テキストを10案作る 💥"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: サムネコピー選択 -> 最終生成 */}
        {step === 4 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-2xl font-extrabold">
                ④ サムネ用テキストを選択
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="bg-white p-4 rounded text-sm whitespace-pre-wrap h-80 overflow-y-auto border border-pink-100">
                {thumbOptions}
              </div>
              <label className="font-bold text-pink-800 block">
                採用するナンバー：
              </label>
              <select
                className="w-full p-3 border-2 border-pink-200 rounded-md bg-white font-bold"
                value={selectedThumbNo}
                onChange={(e) => setSelectedThumbNo(e.target.value)}
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
                    mode: "generate-image-prompt",
                    selectedThumbNo,
                    thumbOptionsList: thumbOptions,
                    blogResult,
                  });
                  setFinalResult(res);
                  setStep(5);
                }}
                disabled={loading}
              >
                {loading
                  ? "🪄 最終処理中..."
                  : "画像プロンプト＆SNS投稿文を作成 ✨"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 5: 生成完了トランジション */}
        {step === 5 && (
          <Card className="shadow-lg border-pink-200 border-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-pink-800 text-3xl font-extrabold text-center">
                ⑤ 全ての素材が揃いました！
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Button
                className="w-full h-16 text-xl font-bold bg-pink-600 hover:bg-pink-700 rounded-full text-white shadow-lg animate-pulse"
                onClick={() => setStep(6)}
              >
                🎉 生成結果をすべて表示する
              </Button>
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
              <p className="text-pink-600 font-bold mt-2">
                あとは順番にコピペするだけです！
              </p>
            </div>

            <Card className="shadow-lg border-pink-200 border-2">
              <CardHeader>
                <CardTitle className="text-pink-800 text-2xl font-extrabold">
                  ① ブログ記事（タイトル＋本文）
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
