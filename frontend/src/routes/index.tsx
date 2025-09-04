import React, { useEffect, useState } from "react";

type Thread = {
  id: string;
  title: string;
  comments: { id: string; content: string; user: string; createdAt: string }[];
};

export const Index: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  // 新規スレッド用の入力
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch("http://localhost:8787/api/threads");
      const data = await res.json();
      setThreads(data);
    } catch (err) {
      console.error("スレッド取得失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    await fetch("http://localhost:8787/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    fetchThreads();
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">2cn トップページ</h1>

      {/* スレッド投稿フォーム */}
      <form onSubmit={handleCreateThread} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="スレッドタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
        />
        <textarea
          placeholder="最初のコメント"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          スレッド作成
        </button>
      </form>

      {/* スレッド一覧 */}
      <div className="space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className="border-b pb-2">
            <a
              href={`/threads/${thread.id}`}
              className="text-blue-600 font-semibold hover:underline"
            >
              {thread.title}
            </a>
            <div className="text-sm text-gray-700 mt-1">
              {thread.comments[0]
                ? `${thread.comments[0].user}: ${thread.comments[0].content}`
                : "まだコメントはありません"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
