import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

const ThreadDetail: React.FC = () => {
  const { id } = useParams();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  // フォーム用 state
  const [content, setContent] = useState("");
  const [user, setUser] = useState("");

  const fetchThread = async () => {
    try {
      const res = await fetch(`http://localhost:8787/api/threads/${id}`);
      if (!res.ok) throw new Error("スレッド取得失敗");
      const data = await res.json();
      setThread(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchThread();
  }, [id]);

  // コメント投稿処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    const res = await fetch(`http://localhost:8787/api/threads/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, user }),
    });

    if (res.ok) {
      setContent("");
      setUser("");
      fetchThread(); // 再読み込み
    } else {
      console.error("コメント投稿失敗");
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (!thread) return <div>スレッドが見つかりません</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {thread.comments.map((c) => (
          <div key={c.id} className="border-b pb-2">
            <span className="font-semibold">{c.user}</span>: {c.content}
            <div className="text-xs text-gray-500">
              {new Date(c.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="space-y-2 border p-4 rounded">
        <h2 className="font-bold">コメントを投稿する</h2>
        <textarea
          placeholder="コメント内容"
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
          投稿
        </button>
      </form>
    </div>
  );
};

export default ThreadDetail;
