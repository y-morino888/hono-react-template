import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type DeleteRequest = {
  id: string;
  threadId: string;
  commentId: string;
  reason: string;
  createdAt: string;
};

const AdminPage: React.FC = () => {
  const [requests, setRequests] = useState<DeleteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return; // ログインしてない
    setIsAdmin(true);
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:8787/api/delete-requests");
      if (!res.ok) throw new Error("取得失敗");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("削除依頼取得失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">管理者画面</h1>
        <p className="text-red-500">管理者ログインが必要です。</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← ホームへ戻る
        </Link>
      </div>
    );
  }

  if (loading) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">削除依頼一覧</h1>
      <Link to="/" className="text-blue-600 hover:underline">
        ← ホームへ戻る
      </Link>

      {requests.length === 0 ? (
        <p className="text-gray-500">削除依頼はありません。</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="border p-4 rounded shadow-sm">
              <p>
                <span className="font-bold">スレッドID:</span> {r.threadId}
              </p>
              <p>
                <span className="font-bold">コメントID:</span> {r.commentId}
              </p>
              <p>
                <span className="font-bold">理由:</span> {r.reason}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(r.createdAt).toLocaleString()}
              </p>
<Link
  to={`/threads/${r.threadId}?highlight=${r.commentId}`}
  className="text-blue-600 underline"
>
  該当コメントへ
</Link>


            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
