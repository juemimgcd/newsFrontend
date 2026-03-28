import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Paginator } from "../components/Paginator";
import { EmptyState } from "../components/EmptyState";
import {
  ApiError,
  getAdminFavoriteRanking,
  getAdminLoginStreak,
  getAdminNews,
  getAdminPeakConcurrent,
  getAdminUsers,
  getCategories,
} from "../lib/api";
import { formatCompactNumber, formatDate, formatDateTime, getCategoryName } from "../lib/format";
import type {
  AdminFavoriteRankingData,
  AdminLoginStreakData,
  AdminNewsListData,
  AdminPeakConcurrentData,
  AdminSession,
  AdminUserListData,
  Category,
} from "../types";

interface AdminDashboardPageProps {
  session: AdminSession | null;
  onSessionChange: (session: AdminSession) => void;
  onSignOut: () => void;
}

export function AdminDashboardPage({
  session,
  onSessionChange,
  onSignOut,
}: AdminDashboardPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersKeywordInput, setUsersKeywordInput] = useState("");
  const [usersKeyword, setUsersKeyword] = useState("");
  const [newsPage, setNewsPage] = useState(1);
  const [newsKeywordInput, setNewsKeywordInput] = useState("");
  const [newsKeyword, setNewsKeyword] = useState("");
  const [newsCategoryId, setNewsCategoryId] = useState<number | undefined>(undefined);
  const [streakPage, setStreakPage] = useState(1);
  const [streakDays, setStreakDays] = useState(3);
  const [rankingLimit, setRankingLimit] = useState(8);
  const [rankingCategoryId, setRankingCategoryId] = useState<number | undefined>(undefined);
  const [peakDate, setPeakDate] = useState(new Date().toISOString().slice(0, 10));
  const [peakLimit, setPeakLimit] = useState(8);
  const [peakCategoryId, setPeakCategoryId] = useState<number | undefined>(undefined);
  const [usersData, setUsersData] = useState<AdminUserListData>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false,
  });
  const [newsData, setNewsData] = useState<AdminNewsListData>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false,
  });
  const [streakData, setStreakData] = useState<AdminLoginStreakData>({
    days: 3,
    list: [],
    total: 0,
  });
  const [rankingData, setRankingData] = useState<AdminFavoriteRankingData>({
    list: [],
    limit: 8,
  });
  const [peakData, setPeakData] = useState<AdminPeakConcurrentData>({
    date: peakDate,
    list: [],
    total: 0,
    limit: 8,
  });
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
  const [errorKeys, setErrorKeys] = useState<Record<string, string>>({});

  function setLoading(section: string, value: boolean) {
    setLoadingKeys((current) => ({
      ...current,
      [section]: value,
    }));
  }

  function setSectionError(section: string, message: string) {
    setErrorKeys((current) => ({
      ...current,
      [section]: message,
    }));
  }

  function handleUnauthorized(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      onSignOut();
      return true;
    }

    return false;
  }

  useEffect(() => {
    if (session) {
      onSessionChange(session);
    }
  }, [onSessionChange, session]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const rows = await getCategories();
        if (!cancelled) {
          setCategories(rows);
        }
      } catch (error) {
        if (!cancelled) {
          setSectionError(
            "categories",
            error instanceof Error ? error.message : "Unable to load categories.",
          );
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    setLoading("users", true);
    setSectionError("users", "");

    getAdminUsers(session.token, usersPage, 10, usersKeyword)
      .then((rows) => {
        if (!cancelled) {
          setUsersData(rows);
        }
      })
      .catch((error) => {
        if (handleUnauthorized(error)) {
          return;
        }
        if (!cancelled) {
          setSectionError("users", error instanceof Error ? error.message : "Unable to load users.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading("users", false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session, usersKeyword, usersPage]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    setLoading("news", true);
    setSectionError("news", "");

    getAdminNews(session.token, newsPage, 10, newsKeyword, newsCategoryId)
      .then((rows) => {
        if (!cancelled) {
          setNewsData(rows);
        }
      })
      .catch((error) => {
        if (handleUnauthorized(error)) {
          return;
        }
        if (!cancelled) {
          setSectionError("news", error instanceof Error ? error.message : "Unable to load news.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading("news", false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [newsCategoryId, newsKeyword, newsPage, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    setLoading("streak", true);
    setSectionError("streak", "");

    getAdminLoginStreak(session.token, streakDays, streakPage, 10)
      .then((rows) => {
        if (!cancelled) {
          setStreakData(rows);
        }
      })
      .catch((error) => {
        if (handleUnauthorized(error)) {
          return;
        }
        if (!cancelled) {
          setSectionError(
            "streak",
            error instanceof Error ? error.message : "Unable to load streak data.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading("streak", false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session, streakDays, streakPage]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    setLoading("ranking", true);
    setSectionError("ranking", "");

    getAdminFavoriteRanking(session.token, rankingLimit, rankingCategoryId)
      .then((rows) => {
        if (!cancelled) {
          setRankingData(rows);
        }
      })
      .catch((error) => {
        if (handleUnauthorized(error)) {
          return;
        }
        if (!cancelled) {
          setSectionError(
            "ranking",
            error instanceof Error ? error.message : "Unable to load favorite ranking.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading("ranking", false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rankingCategoryId, rankingLimit, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    setLoading("peak", true);
    setSectionError("peak", "");

    getAdminPeakConcurrent(session.token, peakDate, peakLimit, peakCategoryId)
      .then((rows) => {
        if (!cancelled) {
          setPeakData(rows);
        }
      })
      .catch((error) => {
        if (handleUnauthorized(error)) {
          return;
        }
        if (!cancelled) {
          setSectionError(
            "peak",
            error instanceof Error ? error.message : "Unable to load peak concurrent views.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading("peak", false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [peakCategoryId, peakDate, peakLimit, session]);

  const metrics = useMemo(
    () => [
      { label: "Users found", value: formatCompactNumber(usersData.total) },
      { label: "News rows", value: formatCompactNumber(newsData.total) },
      { label: "Streak matches", value: formatCompactNumber(streakData.total) },
      {
        label: "Top favorite count",
        value: formatCompactNumber(rankingData.list[0]?.favoriteCount ?? 0),
      },
    ],
    [newsData.total, rankingData.list, streakData.total, usersData.total],
  );

  if (!session) {
    return <Navigate to="/admin" replace />;
  }

  function handleUserSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUsersPage(1);
    setUsersKeyword(usersKeywordInput);
  }

  function handleNewsSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsPage(1);
    setNewsKeyword(newsKeywordInput);
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">Admin operations</p>
          <h1>Review backend control room</h1>
          <p>
            Signed in as {session.adminInfo.nickname || session.adminInfo.username}. Use this desk
            to inspect users, content, and analytics endpoints in one place.
          </p>
        </div>
        <div className="admin-topbar__actions">
          <Link className="ghost-button ghost-button--outlined ghost-button--dark" to="/app/home">
            Open user app
          </Link>
          <button
            type="button"
            className="ghost-button ghost-button--outlined ghost-button--dark"
            onClick={onSignOut}
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="admin-metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="admin-metric-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      {errorKeys.categories ? <div className="form-feedback form-feedback--dark">{errorKeys.categories}</div> : null}

      <section className="admin-grid">
        <article className="admin-panel">
          <div className="section-heading section-heading--dark">
            <div>
              <p className="eyebrow">Users</p>
              <h3>User list</h3>
            </div>
          </div>
          <form className="toolbar-row" onSubmit={handleUserSearch}>
            <div className="input-shell input-shell--dark">
              <input
                placeholder="Search username, nickname, phone"
                value={usersKeywordInput}
                onChange={(event) => setUsersKeywordInput(event.target.value)}
              />
            </div>
            <button type="submit" className="ghost-button ghost-button--outlined ghost-button--dark">
              Search
            </button>
          </form>
          {errorKeys.users ? <div className="form-feedback form-feedback--dark">{errorKeys.users}</div> : null}
          {loadingKeys.users ? (
            <div className="loading-strip loading-strip--dark">Loading users...</div>
          ) : usersData.list.length > 0 ? (
            <>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Nickname</th>
                      <th>Phone</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.list.map((item) => (
                      <tr key={item.id}>
                        <td>{item.username}</td>
                        <td>{item.nickname || "Not set"}</td>
                        <td>{item.phone || "Not set"}</td>
                        <td>{formatDateTime(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paginator page={usersPage} hasMore={usersData.hasMore} onChange={setUsersPage} />
            </>
          ) : (
            <EmptyState title="No users returned" description="Adjust the keyword filter and try again." />
          )}
        </article>

        <article className="admin-panel">
          <div className="section-heading section-heading--dark">
            <div>
              <p className="eyebrow">News corpus</p>
              <h3>News list</h3>
            </div>
          </div>
          <form className="toolbar-grid" onSubmit={handleNewsSearch}>
            <div className="input-shell input-shell--dark">
              <input
                placeholder="Search title, author, description"
                value={newsKeywordInput}
                onChange={(event) => setNewsKeywordInput(event.target.value)}
              />
            </div>
            <div className="input-shell input-shell--dark">
              <select
                value={newsCategoryId ?? ""}
                onChange={(event) =>
                  setNewsCategoryId(event.target.value ? Number(event.target.value) : undefined)
                }
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="ghost-button ghost-button--outlined ghost-button--dark">
              Filter
            </button>
          </form>
          {errorKeys.news ? <div className="form-feedback form-feedback--dark">{errorKeys.news}</div> : null}
          {loadingKeys.news ? (
            <div className="loading-strip loading-strip--dark">Loading news...</div>
          ) : newsData.list.length > 0 ? (
            <>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Views</th>
                      <th>Favorites</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsData.list.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{getCategoryName(categories, item.categoryId)}</td>
                        <td>{formatCompactNumber(item.views)}</td>
                        <td>{formatCompactNumber(item.favoriteCount ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paginator page={newsPage} hasMore={newsData.hasMore} onChange={setNewsPage} />
            </>
          ) : (
            <EmptyState title="No news rows found" description="Adjust the filters and try again." />
          )}
        </article>

        <article className="admin-panel">
          <div className="section-heading section-heading--dark">
            <div>
              <p className="eyebrow">Retention signal</p>
              <h3>Login streaks</h3>
            </div>
          </div>
          <div className="toolbar-grid toolbar-grid--tight">
            <div className="input-shell input-shell--dark">
              <input
                type="number"
                min={1}
                max={99}
                value={streakDays}
                onChange={(event) => {
                  setStreakDays(Number(event.target.value));
                  setStreakPage(1);
                }}
              />
            </div>
            <span className="capsule capsule--dark">Minimum days</span>
          </div>
          {errorKeys.streak ? <div className="form-feedback form-feedback--dark">{errorKeys.streak}</div> : null}
          {loadingKeys.streak ? (
            <div className="loading-strip loading-strip--dark">Loading streaks...</div>
          ) : streakData.list.length > 0 ? (
            <>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Nickname</th>
                      <th>Streak days</th>
                      <th>Last login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streakData.list.map((item) => (
                      <tr key={`${item.userId}-${item.lastLoginDate}`}>
                        <td>{item.username}</td>
                        <td>{item.nickname || "Not set"}</td>
                        <td>{item.streakDays}</td>
                        <td>{formatDate(item.lastLoginDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paginator
                page={streakPage}
                hasMore={streakPage * 10 < streakData.total}
                onChange={setStreakPage}
              />
            </>
          ) : (
            <EmptyState title="No streak matches" description="Try a smaller minimum day count." />
          )}
        </article>

        <article className="admin-panel">
          <div className="section-heading section-heading--dark">
            <div>
              <p className="eyebrow">Ranking</p>
              <h3>Favorite leaders</h3>
            </div>
          </div>
          <div className="toolbar-grid">
            <div className="input-shell input-shell--dark">
              <input
                type="number"
                min={1}
                max={100}
                value={rankingLimit}
                onChange={(event) => setRankingLimit(Number(event.target.value))}
              />
            </div>
            <div className="input-shell input-shell--dark">
              <select
                value={rankingCategoryId ?? ""}
                onChange={(event) =>
                  setRankingCategoryId(event.target.value ? Number(event.target.value) : undefined)
                }
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errorKeys.ranking ? <div className="form-feedback form-feedback--dark">{errorKeys.ranking}</div> : null}
          {loadingKeys.ranking ? (
            <div className="loading-strip loading-strip--dark">Loading ranking...</div>
          ) : rankingData.list.length > 0 ? (
            <ol className="ranking-list">
              {rankingData.list.map((item) => (
                <li key={item.newsId}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{getCategoryName(categories, item.categoryId)}</span>
                  </div>
                  <div>
                    <strong>{item.favoriteCount}</strong>
                    <span>{formatDateTime(item.publishedTime)}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No ranking data" description="This ranking is empty for the current filter." />
          )}
        </article>

        <article className="admin-panel admin-panel--wide">
          <div className="section-heading section-heading--dark">
            <div>
              <p className="eyebrow">Peak viewers</p>
              <h3>Concurrent viewing</h3>
            </div>
          </div>
          <div className="toolbar-grid">
            <div className="input-shell input-shell--dark">
              <input type="date" value={peakDate} onChange={(event) => setPeakDate(event.target.value)} />
            </div>
            <div className="input-shell input-shell--dark">
              <input
                type="number"
                min={1}
                max={100}
                value={peakLimit}
                onChange={(event) => setPeakLimit(Number(event.target.value))}
              />
            </div>
            <div className="input-shell input-shell--dark">
              <select
                value={peakCategoryId ?? ""}
                onChange={(event) =>
                  setPeakCategoryId(event.target.value ? Number(event.target.value) : undefined)
                }
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errorKeys.peak ? <div className="form-feedback form-feedback--dark">{errorKeys.peak}</div> : null}
          {loadingKeys.peak ? (
            <div className="loading-strip loading-strip--dark">Loading peak concurrent views...</div>
          ) : peakData.list.length > 0 ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Peak viewers</th>
                    <th>Peak time</th>
                  </tr>
                </thead>
                <tbody>
                  {peakData.list.map((item) => (
                    <tr key={`${item.newsId}-${item.statDate}`}>
                      <td>{item.title}</td>
                      <td>{getCategoryName(categories, item.categoryId)}</td>
                      <td>{formatDate(item.statDate)}</td>
                      <td>{item.peakConcurrentViewers}</td>
                      <td>{formatDateTime(item.peakTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No peak concurrent data"
              description="The backend currently returns an empty placeholder for this analytics endpoint."
            />
          )}
        </article>
      </section>
    </main>
  );
}
