import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

type Comment = {
  id: string;
  content: string;
  user: string;
  createdAt: string;
  userId?: string;
};

type Thread = {
  id: string;
  title: string;
  createdAt: string;
  comments: Comment[];
};

const COMMENTS_PER_PAGE = 100;

const ThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const pageParam = searchParams.get("page");
  const [page, setPage] = useState(pageParam ? Number(pageParam) : 1);

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  const [commentContent, setCommentContent] = useState("");
  const [commentUser, setCommentUser] = useState("");

  // 管理者ログイン用
  const [adminTokenInput, setAdminTokenInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // フロント側だけで削除扱いにする ID
  const [abonedIds, setAbonedIds] = useState<string[]>([]);

  // 削除依頼フォーム
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchThread();
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) setIsAdmin(true);
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    // ページパラメータが変わったらstateも更新
    setPage(pageParam ? Number(pageParam) : 1);
    // eslint-disable-next-line
  }, [pageParam]);

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

  // highlightId のコメントへスクロール
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
      setAbonedIds((prev) => [...prev, commentId]);
    } else {
      console.error("コメント削除失敗");
    }
  };

  // 削除依頼送信（ユーザー用）
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

  // コメント番号から ID を取得
  const findCommentIdByNumber = (num: number): string | null => {
    if (!thread?.comments) return null;
    const target = thread.comments[num - 1];
    return target ? target.id : null;
  };

  // >>番号 をリンク化する関数
  const parseContent = (text: string) => {
    const regex = />>(\d+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    text.replace(regex, (match, num, offset) => {
      if (lastIndex < offset) {
        parts.push(text.slice(lastIndex, offset));
      }
      const targetId = findCommentIdByNumber(Number(num));
      if (targetId) {
        parts.push(
          <Link
            key={offset}
            to={`?highlight=${targetId}${page > 1 ? `&page=${page}` : ""}`}
            className="text-blue-600 hover:underline"
          >
            {match}
          </Link>
        );
      } else {
        parts.push(match);
      }
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // 返信ボタン → テキストエリアに >>番号 を追加
  const handleReply = (num: number) => {
    setCommentContent((prev) =>
      prev ? prev + `\n>>${num} ` : `>>${num} `
    );
  };

  if (loading) return <div>読み込み中...</div>;
  if (!thread) return <div>スレッドが見つかりません</div>;

  // ページング処理
  const totalComments = thread.comments.length;
  const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
  const startIndex = (page - 1) * COMMENTS_PER_PAGE;
  const paginatedComments = thread.comments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Link to="/" className="text-blue-600 hover:underline">
        ← 戻る
      </Link>

      <h1 className="text-2xl font-bold">{thread.title}</h1>

      {/* コメント一覧 */}
      <div className="space-y-2">
        {paginatedComments.length > 0 ? (
          paginatedComments.map((c, index) => {
            const globalIndex = startIndex + index;
            const isAboned =
              abonedIds.includes(c.id) ||
              c.user === "あぼーん" ||
              c.content === "あぼーん";
            return (
              <div
                key={c.id}
                id={`comment-${c.id}`}
                className={`border-b pb-2 text-sm space-y-1 ${
                  c.id === highlightId ? "bg-yellow-100" : ""
                }`}
              >
                {/* 上段: 名前 + ユーザーID */}
                <div className="text-sm">
                  {globalIndex + 1} 名前：{isAboned ? "あぼーん" : c.user}
                  {"　"}ID：{isAboned ? "あぼーん" : c.userId?.slice(0, 8) ?? "???"}
                </div>

                {/* 中段: 投稿日 + コメントID */}
                <div className="text-xs text-gray-500">
                  投稿日：{isAboned ? "あぼーん" : new Date(c.createdAt).toLocaleString()}
                  {"　"}コメントID：{isAboned ? "あぼーん" : c.id.slice(0, 8)}
                </div>

                {/* 本文 */}
                <div className="mt-2 whitespace-pre-wrap">
                  {isAboned ? "あぼーん" : parseContent(c.content)}
                </div>

                {/* 下段: ボタン類 */}
                {!isAboned && (
                  <div className="flex space-x-3 mt-2 text-sm">
                    <button
                      onClick={() => handleReply(globalIndex + 1)}
                      className="text-green-600 hover:underline"
                    >
                      返信
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:underline"
                      >
                        削除
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setOpenForm(openForm === c.id ? null : c.id)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      削除依頼
                    </button>
                  </div>
                )}

                {/* 削除依頼フォーム */}
                {openForm === c.id && !isAboned && (
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
              </div>
            );
          })
        ) : (
          <div className="text-gray-500 text-sm">まだコメントはありません</div>
        )}
      </div>

      {/* ページネーション */}
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => {
            setSearchParams((params) => {
              params.set("page", String(Math.max(1, page - 1)));
              if (highlightId) params.set("highlight", highlightId);
              return params;
            });
          }}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          ← 前
        </button>
        <span className="px-2">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => {
            setSearchParams((params) => {
              params.set("page", String(Math.min(totalPages, page + 1)));
              if (highlightId) params.set("highlight", highlightId);
              return params;
            });
          }}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          次 →
        </button>
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