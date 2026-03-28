import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { NewsCard } from "../components/NewsCard";
import type { UserLayoutContext } from "../components/UserAppLayout";
import {
  ApiError,
  addFavorite,
  addHistory,
  checkFavorite,
  getNewsDetail,
  removeFavorite,
} from "../lib/api";
import { formatCompactNumber, formatDateTime, getCategoryName, splitArticleContent } from "../lib/format";
import type { NewsDetailData } from "../types";

export function NewsDetailPage() {
  const { newsId } = useParams();
  const { session, categories, signOut } = useOutletContext<UserLayoutContext>();
  const [detailData, setDetailData] = useState<NewsDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  const parsedNewsId = Number(newsId);

  useEffect(() => {
    if (!parsedNewsId) {
      setError("The requested story is invalid.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      setError("");

      try {
        const [nextDetail, favoriteState] = await Promise.all([
          getNewsDetail(parsedNewsId),
          checkFavorite(session.token, parsedNewsId),
        ]);

        if (!cancelled) {
          setDetailData(nextDetail);
          setIsFavorite(favoriteState.isFavorite);
        }

        void addHistory(session.token, parsedNewsId).catch(() => undefined);
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          signOut();
          return;
        }

        if (!cancelled) {
          setError(
            requestError instanceof Error ? requestError.message : "Unable to load this story.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [parsedNewsId, session.token, signOut]);

  const paragraphs = useMemo(
    () => splitArticleContent(detailData?.detail.content || detailData?.detail.description),
    [detailData],
  );

  async function toggleFavorite() {
    if (!detailData) {
      return;
    }

    setFavoriteBusy(true);
    setError("");

    try {
      if (isFavorite) {
        await removeFavorite(session.token, detailData.detail.id);
        setIsFavorite(false);
      } else {
        await addFavorite(session.token, detailData.detail.id);
        setIsFavorite(true);
      }
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        signOut();
        return;
      }

      setError(
        requestError instanceof Error ? requestError.message : "Unable to update favorites.",
      );
    } finally {
      setFavoriteBusy(false);
    }
  }

  if (loading) {
    return <div className="loading-strip">Loading story...</div>;
  }

  if (!detailData) {
    return (
      <EmptyState
        title="Story unavailable"
        description={error || "The story could not be found or loaded."}
      />
    );
  }

  return (
    <div className="page-stack">
      {error ? <div className="form-feedback">{error}</div> : null}

      <article className="article-shell">
        <section className="article-hero">
          <div className="article-hero__copy">
            <Link className="capsule capsule--link" to="/app/home">
              Back to feed
            </Link>
            <p className="eyebrow">{getCategoryName(categories, detailData.detail.categoryId)}</p>
            <h2>{detailData.detail.title}</h2>
            <p>{detailData.detail.description || "A fuller read from the editorial desk."}</p>

            <div className="article-meta">
              <span>{detailData.detail.author || "Desk contributor"}</span>
              <span>{formatDateTime(detailData.detail.publishedTime)}</span>
              <span>{formatCompactNumber(detailData.detail.views)} views</span>
            </div>

            <div className="article-actions">
              <button
                type="button"
                className={`primary-button primary-button--soft ${isFavorite ? "is-active" : ""}`}
                disabled={favoriteBusy}
                onClick={toggleFavorite}
              >
                {favoriteBusy ? "Updating..." : isFavorite ? "Saved to favorites" : "Save to favorites"}
              </button>
            </div>
          </div>

          <div className="article-hero__visual">
            {detailData.detail.image ? (
              <img src={detailData.detail.image} alt={detailData.detail.title} />
            ) : (
              <div className="news-card__placeholder news-card__placeholder--large">
                <span>{getCategoryName(categories, detailData.detail.categoryId)}</span>
              </div>
            )}
          </div>
        </section>

        <section className="article-body">
          <div className="article-body__main">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)
            ) : (
              <p>No body content is available for this story yet.</p>
            )}
          </div>

          <aside className="article-side">
            <div className="metric-card">
              <span>Category</span>
              <strong>{getCategoryName(categories, detailData.detail.categoryId)}</strong>
              <p>Use the feed page to browse more stories from this desk.</p>
            </div>
            <div className="metric-card">
              <span>Publishing time</span>
              <strong>{formatDateTime(detailData.detail.publishedTime)}</strong>
              <p>The backend increments views automatically when detail loads.</p>
            </div>
          </aside>
        </section>
      </article>

      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Continue reading</p>
            <h3>Related stories</h3>
          </div>
        </div>

        {detailData.related.length > 0 ? (
          <div className="story-grid">
            {detailData.related.map((item) => (
              <NewsCard key={item.id} item={item} categories={categories} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No related stories yet"
            description="This category does not have any neighboring stories to suggest."
          />
        )}
      </section>
    </div>
  );
}
