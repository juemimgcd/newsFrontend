import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { NewsCard } from "../components/NewsCard";
import { Paginator } from "../components/Paginator";
import type { UserLayoutContext } from "../components/UserAppLayout";
import { ApiError, getNewsList, getRecommendations } from "../lib/api";
import { formatCompactNumber, getCategoryName } from "../lib/format";
import type { NewsItem, NewsListData } from "../types";

export function HomePage() {
  const { session, profile, categories, bootstrapError, signOut } =
    useOutletContext<UserLayoutContext>();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [recommendations, setRecommendations] = useState<NewsItem[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [newsData, setNewsData] = useState<NewsListData>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 9,
    hasMore: false,
  });

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setRecommendLoading(true);

      try {
        const rows = await getRecommendations(session.token, 6);
        if (!cancelled) {
          setRecommendations(rows);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          signOut();
          return;
        }

        if (!cancelled) {
          setPageError(error instanceof Error ? error.message : "Unable to load recommendations.");
        }
      } finally {
        if (!cancelled) {
          setRecommendLoading(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [session.token, signOut]);

  useEffect(() => {
    const activeCategory = selectedCategory;

    if (activeCategory === null) {
      return;
    }

    const categoryId = activeCategory;

    let cancelled = false;

    async function loadFeed() {
      setFeedLoading(true);
      setPageError("");

      try {
        const nextNews = await getNewsList(categoryId, page, 9);
        if (!cancelled) {
          setNewsData(nextNews);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          signOut();
          return;
        }

        if (!cancelled) {
          setPageError(error instanceof Error ? error.message : "Unable to load the category feed.");
        }
      } finally {
        if (!cancelled) {
          setFeedLoading(false);
        }
      }
    }

    void loadFeed();

    return () => {
      cancelled = true;
    };
  }, [page, selectedCategory, signOut]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategory) {
      return "No category selected";
    }

    return getCategoryName(categories, selectedCategory);
  }, [categories, selectedCategory]);

  return (
    <div className="page-stack">
      <section className="page-hero page-hero--reader">
        <div>
          <p className="eyebrow">Good morning</p>
          <h2>{profile.nickname || profile.username}, your desk is ready.</h2>
          <p>
            Jump into tailored recommendations, then sweep through category feeds with a reading
            layout that feels deliberate instead of generic.
          </p>
        </div>

        <div className="hero-stat-grid">
          <article className="metric-card">
            <span>Recommendations</span>
            <strong>{recommendLoading ? "..." : formatCompactNumber(recommendations.length)}</strong>
            <p>Personalized stories from your recent behavior.</p>
          </article>
          <article className="metric-card">
            <span>Categories</span>
            <strong>{formatCompactNumber(categories.length)}</strong>
            <p>Public sections imported from the backend.</p>
          </article>
          <article className="metric-card">
            <span>Feed total</span>
            <strong>{formatCompactNumber(newsData.total)}</strong>
            <p>Stories currently available in {activeCategoryName}.</p>
          </article>
        </div>
      </section>

      {bootstrapError || pageError ? (
        <div className="form-feedback">{bootstrapError || pageError}</div>
      ) : null}

      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">For you</p>
            <h3>Recommended stories</h3>
          </div>
        </div>

        {recommendLoading ? (
          <div className="loading-strip">Loading recommendations...</div>
        ) : recommendations.length > 0 ? (
          <div className="story-grid">
            {recommendations.map((item) => (
              <NewsCard key={item.id} item={item} categories={categories} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Recommendations are quiet right now"
            description="Log in, read a few stories, and the personalized feed will begin to feel more specific."
          />
        )}
      </section>

      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Browse by desk</p>
            <h3>{activeCategoryName}</h3>
          </div>
          <span className="capsule">{formatCompactNumber(newsData.total)} stories</span>
        </div>

        {categories.length > 0 ? (
          <div className="chip-row">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`chip-button ${selectedCategory === category.id ? "is-active" : ""}`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setPage(1);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No categories found"
            description="The backend did not return any public news categories yet."
          />
        )}

        {feedLoading ? (
          <div className="loading-strip">Loading category feed...</div>
        ) : newsData.items.length > 0 ? (
          <>
            <div className="story-grid">
              {newsData.items.map((item) => (
                <NewsCard key={item.id} item={item} categories={categories} />
              ))}
            </div>
            <Paginator page={page} hasMore={newsData.hasMore} onChange={setPage} />
          </>
        ) : selectedCategory ? (
          <EmptyState
            title="No stories in this category yet"
            description={`The ${activeCategoryName} desk is currently empty.`}
          />
        ) : null}
      </section>
    </div>
  );
}
