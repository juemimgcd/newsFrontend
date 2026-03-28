import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Paginator } from "../components/Paginator";
import type { UserLayoutContext } from "../components/UserAppLayout";
import { ApiError, clearHistory, deleteHistory, getHistoryList } from "../lib/api";
import { excerpt, formatDateTime, getCategoryName } from "../lib/format";
import type { HistoryListData } from "../types";

export function HistoryPage() {
  const { session, categories, signOut } = useOutletContext<UserLayoutContext>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [data, setData] = useState<HistoryListData>({
    list: [],
    total: 0,
    hasMore: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const nextData = await getHistoryList(session.token, page, 6);
        if (!cancelled) {
          setData(nextData);
        }
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          signOut();
          return;
        }

        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [page, refreshIndex, session.token, signOut]);

  async function handleDelete(historyId: number) {
    try {
      await deleteHistory(session.token, historyId);
      setRefreshIndex((value) => value + 1);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        signOut();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to delete history.");
    }
  }

  async function handleClear() {
    try {
      await clearHistory(session.token);
      if (page !== 1) {
        setPage(1);
      }
      setRefreshIndex((value) => value + 1);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        signOut();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to clear history.");
    }
  }

  return (
    <div className="page-stack">
      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Reading memory</p>
            <h3>Your history</h3>
          </div>
          <button type="button" className="ghost-button ghost-button--outlined" onClick={handleClear}>
            Clear all
          </button>
        </div>

        {error ? <div className="form-feedback">{error}</div> : null}

        {loading ? (
          <div className="loading-strip">Loading history...</div>
        ) : data.list.length > 0 ? (
          <>
            <div className="collection-grid">
              {data.list.map((item) => (
                <article key={item.historyId || item.id} className="collection-card">
                  <div className="collection-card__meta">
                    <span className="capsule">{getCategoryName(categories, item.categoryId)}</span>
                    <small>Viewed {formatDateTime(item.viewTime)}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{excerpt(item.description || item.content)}</p>
                  <div className="collection-card__footer">
                    <Link className="ghost-button ghost-button--outlined" to={`/app/news/${item.id}`}>
                      Reopen
                    </Link>
                    <button
                      type="button"
                      className="ghost-button ghost-button--outlined"
                      onClick={() => handleDelete(item.historyId || 0)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Paginator page={page} hasMore={data.hasMore} onChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="No reading history yet"
            description="Open a story and it will be added here automatically."
          />
        )}
      </section>
    </div>
  );
}
