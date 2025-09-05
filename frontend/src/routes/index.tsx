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
  createdAt: string;
  comments: Comment[];
};

export const Index: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    fetchThreads();
    // eslint-disable-next-line
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch("http://localhost:8787/api/threads");
      const data = await res.json();
      // dataが配列でなければ配列化
      const threadsArray = Array.isArray(data) ? data : Object.values(data);
      setThreads(threadsArray);
    } catch (err) {
      console.error("スレッド取得失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
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
      fetchThreads();
    } else {
      console.error("スレッド作成失敗");
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">2ch 演習</h1>

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
        <input
          type="text"
          placeholder="ユーザー名（任意）"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          スレッド作成
        </button>
      </form>

      {/* スレッド一覧 */}
      <div className="space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className="border-b pb-2">
            <Link
              to={`/threads/${thread.id}`}
              className="text-blue-600 font-semibold hover:underline"
            >
              {thread.title}
            </Link>
            <div className="text-sm text-gray-700 mt-1">
              {Array.isArray(thread.comments) && thread.comments.length > 0
                ? `${thread.comments[0].user}: ${thread.comments[0].content}`
                : "まだコメントはありません"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};