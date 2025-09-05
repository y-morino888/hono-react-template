import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Comment = {
  id: string;
  content: string;
  user: string;
  createdAt: string;
};

type Thread = {
  id: string;
  title: string;
  comments: Comment[];
};

export const Index: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);

  // スレッド一覧取得
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

  useEffect(() => {
    fetchThreads();
    // eslint-disable-next-line
  }, []);

  // スレッド作成
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const res = await fetch("http://localhost:8787/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, user }),
    });

    if (res.ok) {
      setTitle("");
      setContent("");
      setUser("");
      fetchThreads(); // 再読み込み
    } else {
      console.error("スレッド作成失敗");
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">2ch 演習</h1>
      {/* スレッド作成フォーム */}
      <form onSubmit={handleSubmit} className="space-y-2 border p-4 rounded">
        <h2 className="text-xl font-bold">新しいスレッドを作成</h2>
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="最初のコメント"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="ユーザー名（任意）"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          作成
        </button>
      </form>

      {/* スレッド一覧 */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">スレッド一覧</h2>
        {threads.map((thread) => (
          <div key={thread.id} className="border-b pb-4">
            <Link
              to={`/threads/${thread.id}`}
              className="text-blue-600 font-semibold hover:underline"
            >
              {thread.title}
            </Link>
            <div className="mt-2 space-y-1">
              {thread.comments && thread.comments.length > 0 ? (
                thread.comments.map((c) => (
                  <div key={c.id} className="text-sm text-gray-700">
                    <span className="font-semibold">{c.user}</span>: {c.content}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">まだコメントはありません</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};