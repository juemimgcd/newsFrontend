import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Paginator } from "../components/Paginator";
import type { UserLayoutContext } from "../components/UserAppLayout";
import { ApiError, clearFavorites, getFavoriteList, removeFavorite } from "../lib/api";
import { excerpt, formatDateTime, getCategoryName } from "../lib/format";
import type { FavoriteListData } from "../types";

export function FavoritesPage() {
  const { session, categories, signOut } = useOutletContext<UserLayoutContext>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [data, setData] = useState<FavoriteListData>({
    list: [],
    total: 0,
    hasMore: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      setLoading(true);
      setError("");

      try {
        const nextData = await getFavoriteList(session.token, page, 6);
        if (!cancelled) {
          setData(nextData);
        }
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          signOut();
          return;
        }

        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load favorites.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [page, refreshIndex, session.token, signOut]);

  async function handleRemove(newsId: number) {
    try {
      await removeFavorite(session.token, newsId);
      setRefreshIndex((value) => value + 1);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        signOut();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to remove favorite.");
    }
  }

  async function handleClear() {
    try {
      await clearFavorites(session.token);
      if (page !== 1) {
        setPage(1);
      }
      setRefreshIndex((value) => value + 1);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        signOut();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to clear favorites.");
    }
  }

  return (
    <div className="page-stack">
      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Saved desk</p>
            <h3>Your favorites</h3>
          </div>
          <button type="button" className="ghost-button ghost-button--outlined" onClick={handleClear}>
            Clear all
          </button>
        </div>

        {error ? <div className="form-feedback">{error}</div> : null}

        {loading ? (
          <div className="loading-strip">Loading favorite stories...</div>
        ) : data.list.length > 0 ? (
          <>
            <div className="collection-grid">
              {data.list.map((item) => (
                <article key={item.favoriteId || item.id} className="collection-card">
                  <div className="collection-card__meta">
                    <span className="capsule">{getCategoryName(categories, item.categoryId)}</span>
                    <small>Saved {formatDateTime(item.favoriteTime)}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{excerpt(item.description || item.content)}</p>
                  <div className="collection-card__footer">
                    <Link className="ghost-button ghost-button--outlined" to={`/app/news/${item.id}`}>
                      Open story
                    </Link>
                    <button
                      type="button"
                      className="ghost-button ghost-button--outlined"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Paginator page={page} hasMore={data.hasMore} onChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="No favorites saved"
            description="Bookmark stories from the detail page and they will gather here."
          />
        )}
      </section>
    </div>
  );
}
