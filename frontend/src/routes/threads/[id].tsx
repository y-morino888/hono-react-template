import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

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

const ThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  const [commentContent, setCommentContent] = useState("");
  const [commentUser, setCommentUser] = useState("");

  // 管理者ログイン用
  const [adminTokenInput, setAdminTokenInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 削除依頼フォームの状態
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchThread();
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) setIsAdmin(true);
    // eslint-disable-next-line
  }, [id]);

  const fetchThread = async () => {
    try {
      const res = await fetch(`http://localhost:8787/api/threads/${id}`);
      const data = await res.json();
      setThread(data);
    } catch (err) {
      console.error("スレッド取得失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ highlightId のコメントへスクロール
  useEffect(() => {
    if (highlightId && thread?.comments) {
      const target = document.getElementById(`comment-${highlightId}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightId, thread]);

  // コメント投稿
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent) return;

    const res = await fetch(
      `http://localhost:8787/api/threads/${id}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent, user: commentUser }),
      }
    );

    if (res.ok) {
      setCommentContent("");
      setCommentUser("");
      fetchThread();
    } else {
      console.error("コメント投稿失敗");
    }
  };

  // コメント削除（管理者用）
  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return alert("管理者トークンが必要です");

    const res = await fetch(
      `http://localhost:8787/api/threads/${id}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      fetchThread();
    } else {
      console.error("コメント削除失敗");
    }
  };

  // 削除依頼送信（一般ユーザー用）
  const handleDeleteRequest = async (commentId: string) => {
    if (!reason) return alert("理由を入力してください");

    const res = await fetch("http://localhost:8787/api/delete-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: id, commentId, reason }),
    });

    if (res.ok) {
      alert("削除依頼を送信しました");
      setOpenForm(null);
      setReason("");
    } else {
      alert("削除依頼送信に失敗しました");
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (!thread) return <div>スレッドが見つかりません</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Link to="/" className="text-blue-600 hover:underline">
        ← 戻る
      </Link>

      <h1 className="text-2xl font-bold">{thread.title}</h1>

      {/* コメント一覧 */}
      <div className="space-y-2">
        {thread.comments && thread.comments.length > 0 ? (
          thread.comments.map((c) => {
            const isAboned =
              c.user === "あぼーん" || c.content === "あぼーん";
            return (
              <div
                key={c.id}
                id={`comment-${c.id}`} // ✅ スクロール用にID付与
                className={`border-b pb-2 text-sm space-y-1 ${
                  c.id === highlightId ? "bg-yellow-100" : ""
                }`}
              >
                {/* コメント内容 */}
                <div className="flex justify-between items-center">
                  {isAboned ? (
                    <div className="text-gray-400 italic">あぼーん</div>
                  ) : (
                    <>
                      <span className="font-semibold">{c.user}</span>:{" "}
                      {c.content}
                    </>
                  )}

                  {/* 管理者用削除ボタン */}
                  {isAdmin && !isAboned && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="ml-2 text-red-500 text-xs"
                    >
                      削除
                    </button>
                  )}
                </div>

                {/* 一般ユーザー用 削除依頼ボタン */}
                {!isAboned && (
                  <>
                    <button
                      onClick={() =>
                        setOpenForm(openForm === c.id ? null : c.id)
                      }
                      className="text-xs text-red-400 underline"
                    >
                      削除依頼
                    </button>

                    {/* 削除依頼フォーム */}
                    {openForm === c.id && (
                      <div className="mt-2 p-2 border rounded bg-gray-50">
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="削除依頼の理由を書いてください"
                          className="w-full border p-2 rounded"
                        />
                        <button
                          onClick={() => handleDeleteRequest(c.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded mt-2"
                        >
                          送信
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-gray-500 text-sm">
            まだコメントはありません
          </div>
        )}
      </div>

      {/* コメント投稿フォーム */}
      <form
        onSubmit={handleCommentSubmit}
        className="space-y-2 border p-4 rounded"
      >
        <h2 className="text-lg font-bold">コメントを投稿</h2>
        <textarea
          placeholder="コメント内容"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="ユーザー名（任意）"
          value={commentUser}
          onChange={(e) => setCommentUser(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          投稿
        </button>
      </form>

      {/* 管理者ログインフォーム */}
      <div className="mt-10 border-t pt-4">
        <h2 className="text-lg font-bold">管理者</h2>
        {!isAdmin ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (adminTokenInput) {
                localStorage.setItem("adminToken", adminTokenInput);
                setIsAdmin(true);
                setAdminTokenInput("");
              }
            }}
            className="space-y-2"
          >
            <input
              type="password"
              placeholder="管理者トークンを入力"
              value={adminTokenInput}
              onChange={(e) => setAdminTokenInput(e.target.value)}
              className="border p-2 w-full rounded"
            />
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              ログイン
            </button>
          </form>
        ) : (
          <div>
            <p className="mb-2 text-green-600 font-semibold">
              管理者ログイン中
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                setIsAdmin(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              ログアウト
            </button>
            <Link to="/admin" className="ml-4 text-red-500 underline">
              管理者画面へ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadDetail;
