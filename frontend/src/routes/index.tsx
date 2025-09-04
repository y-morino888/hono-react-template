import React, { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await fetch("http://localhost:8787/api/threads");
        const data = await res.json();
        console.log("APIレスポンス:", data); // ← ここで確認
        setThreads(data);
      } catch (err) {
        console.error("スレッド取得失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">2cn トップページ</h1>
      <div className="space-y-6">
        {threads.map((thread) => (
          <div key={thread.id} className="border-b pb-4">
            <a
              href={`/threads/${thread.id}`}
              className="text-blue-600 font-semibold hover:underline"
            >
              {thread.title}
            </a>
            <div className="mt-2 space-y-1">
              {thread.comments && thread.comments.length > 0 ? (
                thread.comments.map((c) => (
                  <div key={c.id} className="text-sm text-gray-700">
                    <span className="font-semibold">{c.user}</span>:{" "}
                    {c.content}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  まだコメントはありません
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
