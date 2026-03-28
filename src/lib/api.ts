import type {
  AdminFavoriteRankingData,
  AdminFavoriteRankingItem,
  AdminInfo,
  AdminLoginStreakData,
  AdminLoginStreakItem,
  AdminNewsListData,
  AdminPeakConcurrentData,
  AdminPeakConcurrentItem,
  AdminSession,
  AdminUserItem,
  AdminUserListData,
  AuthSession,
  Category,
  FavoriteCheckData,
  FavoriteListData,
  HistoryListData,
  NewsDetailData,
  NewsItem,
  NewsListData,
  UserInfo,
  UserProfileUpdatePayload,
} from "../types";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
}

function getString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return undefined;
}

function getNullableString(record: Record<string, unknown>, ...keys: string[]) {
  const value = getString(record, ...keys);
  return value ?? null;
}

function getNumber(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") {
      return value;
    }
  }
  return 0;
}

function getBoolean(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }
  return false;
}

function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function readPayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new ApiError("The server returned an unreadable response.", response.status);
  }
}

async function requestRaw(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = await readPayload(response);
  const payloadRecord = asRecord(payload);

  if (!response.ok) {
    const detail =
      getString(payloadRecord, "detail", "message") || `Request failed with status ${response.status}.`;
    throw new ApiError(detail, response.status);
  }

  if ("code" in payloadRecord && payloadRecord.code !== 200) {
    throw new ApiError(getString(payloadRecord, "message") || "Request failed.", response.status || 500);
  }

  return payloadRecord.data ?? payload;
}

function normalizeCategory(raw: unknown): Category {
  const record = asRecord(raw);
  return {
    id: getNumber(record, "id"),
    name: getString(record, "name") || "Untitled category",
    sortOrder: getNumber(record, "sortOrder", "sort_order"),
  };
}

function normalizeUserInfo(raw: unknown): UserInfo {
  const record = asRecord(raw);
  return {
    id: getNumber(record, "id"),
    username: getString(record, "username") || "unknown",
    nickname: getNullableString(record, "nickname"),
    avatar: getNullableString(record, "avatar"),
    gender: getNullableString(record, "gender"),
    bio: getNullableString(record, "bio"),
    phone: getNullableString(record, "phone"),
    createdAt: getNullableString(record, "createdAt", "created_at"),
  };
}

function normalizeAdminInfo(raw: unknown): AdminInfo {
  const record = asRecord(raw);
  return {
    id: getNumber(record, "id"),
    username: getString(record, "username") || "admin",
    nickname: getNullableString(record, "nickname"),
    isActive: getBoolean(record, "isActive", "is_active"),
    lastLoginAt: getNullableString(record, "lastLoginAt", "last_login_at"),
  };
}

function normalizeNews(raw: unknown): NewsItem {
  const record = asRecord(raw);
  return {
    id: getNumber(record, "id", "newsId", "news_id"),
    title: getString(record, "title") || "Untitled story",
    description: getNullableString(record, "description"),
    content: getNullableString(record, "content"),
    image: getNullableString(record, "image"),
    author: getNullableString(record, "author"),
    categoryId: getNumber(record, "categoryId", "category_id"),
    views: getNumber(record, "views"),
    publishedTime: getNullableString(
      record,
      "publishedTime",
      "publishTime",
      "publish_time",
      "published_at",
    ),
    favoriteCount: getNumber(record, "favoriteCount", "favorite_count"),
    favoriteId: getNumber(record, "favoriteId", "favorite_id") || undefined,
    favoriteTime: getNullableString(record, "favoriteTime", "favorite_time"),
    historyId: getNumber(record, "historyId", "history_id") || undefined,
    viewTime: getNullableString(record, "viewTime", "view_time"),
  };
}

function normalizeNewsListData(raw: unknown): NewsListData {
  const record = asRecord(raw);
  const items = Array.isArray(record.items) ? record.items.map(normalizeNews) : [];

  return {
    items,
    total: getNumber(record, "total"),
    page: getNumber(record, "page"),
    pageSize: getNumber(record, "pageSize", "page_size"),
    hasMore: getBoolean(record, "hasMore", "has_more"),
  };
}

function normalizeFavoriteListData(raw: unknown): FavoriteListData {
  const record = asRecord(raw);
  const list = Array.isArray(record.list) ? record.list.map(normalizeNews) : [];

  return {
    list,
    total: getNumber(record, "total"),
    hasMore: getBoolean(record, "hasMore", "has_more"),
  };
}

function normalizeHistoryListData(raw: unknown): HistoryListData {
  const record = asRecord(raw);
  const list = Array.isArray(record.list) ? record.list.map(normalizeNews) : [];

  return {
    list,
    total: getNumber(record, "total"),
    hasMore: getBoolean(record, "hasMore", "has_more"),
  };
}

function normalizeAdminUsers(raw: unknown): AdminUserListData {
  const record = asRecord(raw);
  const list = Array.isArray(record.list) ? record.list.map((item) => normalizeUserInfo(item) as AdminUserItem) : [];

  return {
    list,
    total: getNumber(record, "total"),
    page: getNumber(record, "page"),
    pageSize: getNumber(record, "pageSize", "page_size"),
    hasMore: getBoolean(record, "hasMore", "has_more"),
  };
}

function normalizeAdminNews(raw: unknown): AdminNewsListData {
  const record = asRecord(raw);
  const list = Array.isArray(record.list) ? record.list.map(normalizeNews) : [];

  return {
    list,
    total: getNumber(record, "total"),
    page: getNumber(record, "page"),
    pageSize: getNumber(record, "pageSize", "page_size"),
    hasMore: getBoolean(record, "hasMore", "has_more"),
  };
}

function normalizeAdminLoginStreak(raw: unknown): AdminLoginStreakData {
  const record = asRecord(raw);
  const list = Array.isArray(record.list)
    ? record.list.map((item) => {
        const row = asRecord(item);
        const normalized: AdminLoginStreakItem = {
          userId: getNumber(row, "userId", "user_id"),
          username: getString(row, "username") || "unknown",
          nickname: getNullableString(row, "nickname"),
          streakDays: getNumber(row, "streakDays", "streak_days"),
          lastLoginDate: getNullableString(row, "lastLoginDate", "last_login_date"),
        };
        return normalized;
      })
    : [];

  return {
    days: getNumber(record, "days"),
    list,
    total: getNumber(record, "total"),
  };
}

function normalizeAdminFavoriteRanking(raw: unknown): AdminFavoriteRankingData {
  const record = asRecord(raw);
  const list = Array.isArray(record.list)
    ? record.list.map((item) => {
        const row = normalizeNews(item);
        const normalized: AdminFavoriteRankingItem = {
          newsId: row.id,
          title: row.title,
          categoryId: row.categoryId,
          views: row.views,
          publishedTime: row.publishedTime,
          favoriteCount: row.favoriteCount ?? 0,
        };
        return normalized;
      })
    : [];

  return {
    list,
    limit: getNumber(record, "limit"),
  };
}

function normalizeAdminPeakConcurrent(raw: unknown): AdminPeakConcurrentData {
  const record = asRecord(raw);
  const list = Array.isArray(record.list)
    ? record.list.map((item) => {
        const row = asRecord(item);
        const normalized: AdminPeakConcurrentItem = {
          newsId: getNumber(row, "newsId", "news_id"),
          title: getString(row, "title") || "Untitled story",
          categoryId: getNumber(row, "categoryId", "category_id"),
          statDate: getString(row, "statDate", "stat_date") || "",
          peakConcurrentViewers: getNumber(row, "peakConcurrentViewers", "peak_concurrent_viewers"),
          peakTime: getNullableString(row, "peakTime", "peak_time"),
        };
        return normalized;
      })
    : [];

  return {
    date: getString(record, "date") || "",
    list,
    total: getNumber(record, "total"),
    limit: getNumber(record, "limit"),
  };
}

export async function loginUser(username: string, password: string) {
  const raw = await requestRaw("/api/user/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const record = asRecord(raw);
  return {
    token: getString(record, "token") || "",
    userInfo: normalizeUserInfo(record.userInfo),
  } satisfies AuthSession;
}

export async function registerUser(username: string, password: string) {
  const raw = await requestRaw("/api/user/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const record = asRecord(raw);
  return {
    token: getString(record, "token") || "",
    userInfo: normalizeUserInfo(record.userInfo),
  } satisfies AuthSession;
}

export async function getUserInfo(token: string) {
  const raw = await requestRaw("/api/user/info", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return normalizeUserInfo(raw);
}

export async function updateUserProfile(token: string, payload: UserProfileUpdatePayload) {
  const raw = await requestRaw("/api/user/update", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return normalizeUserInfo(raw);
}

export async function changeUserPassword(token: string, oldPassword: string, newPassword: string) {
  await requestRaw("/api/user/password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      oldPassword,
      newPassword,
    }),
  });
}

export async function getCategories() {
  const raw = await requestRaw("/api/news/categories");
  return Array.isArray(raw) ? raw.map(normalizeCategory) : [];
}

export async function getNewsList(categoryId: number, page = 1, pageSize = 9) {
  const raw = await requestRaw(
    `/api/news/list${toQuery({
      categoryId,
      page,
      pageSize,
    })}`,
  );
  return normalizeNewsListData(raw);
}

export async function getRecommendations(token: string, limit = 6) {
  const raw = await requestRaw(`/api/news/recommend${toQuery({ limit })}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return Array.isArray(raw) ? raw.map(normalizeNews) : [];
}

export async function getNewsDetail(newsId: number) {
  const raw = await requestRaw(`/api/news/detail${toQuery({ id: newsId })}`);
  const record = asRecord(raw);

  return {
    detail: normalizeNews(record.detail),
    related: Array.isArray(record.related) ? record.related.map(normalizeNews) : [],
  } satisfies NewsDetailData;
}

export async function checkFavorite(token: string, newsId: number) {
  const raw = await requestRaw(`/api/favorite/check${toQuery({ news_id: newsId })}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const record = asRecord(raw);
  return {
    isFavorite: getBoolean(record, "isFavorite", "is_favorite"),
  } satisfies FavoriteCheckData;
}

export async function addFavorite(token: string, newsId: number) {
  await requestRaw("/api/favorite/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      newsId,
    }),
  });
}

export async function removeFavorite(token: string, newsId: number) {
  await requestRaw(`/api/favorite/remove${toQuery({ newsId })}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getFavoriteList(token: string, page = 1, pageSize = 9) {
  const raw = await requestRaw(`/api/favorite/list${toQuery({ page, pageSize })}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return normalizeFavoriteListData(raw);
}

export async function clearFavorites(token: string) {
  await requestRaw("/api/favorite/clear", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addHistory(token: string, newsId: number) {
  await requestRaw("/api/history/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      newsId,
    }),
  });
}

export async function getHistoryList(token: string, page = 1, pageSize = 9) {
  const raw = await requestRaw(`/api/history/list${toQuery({ page, pageSize })}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return normalizeHistoryListData(raw);
}

export async function deleteHistory(token: string, historyId: number) {
  await requestRaw(`/api/history/delete/${historyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function clearHistory(token: string) {
  await requestRaw("/api/history/clear", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function loginAdmin(username: string, password: string) {
  const raw = await requestRaw("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const record = asRecord(raw);
  return {
    token: getString(record, "token") || "",
    adminInfo: normalizeAdminInfo(record.adminInfo),
  } satisfies AdminSession;
}

export async function getAdminUsers(token: string, page = 1, pageSize = 10, keyword = "") {
  const raw = await requestRaw(
    `/api/admin/users${toQuery({
      page,
      pageSize,
      keyword: keyword.trim() || undefined,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return normalizeAdminUsers(raw);
}

export async function getAdminNews(
  token: string,
  page = 1,
  pageSize = 10,
  keyword = "",
  categoryId?: number,
) {
  const raw = await requestRaw(
    `/api/admin/news${toQuery({
      page,
      pageSize,
      keyword: keyword.trim() || undefined,
      categoryId,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return normalizeAdminNews(raw);
}

export async function getAdminLoginStreak(token: string, days: number, page = 1, pageSize = 10) {
  const raw = await requestRaw(
    `/api/admin/users/login-streak${toQuery({
      days,
      page,
      pageSize,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return normalizeAdminLoginStreak(raw);
}

export async function getAdminFavoriteRanking(
  token: string,
  limit = 10,
  categoryId?: number,
) {
  const raw = await requestRaw(
    `/api/admin/news/favorite-ranking${toQuery({
      limit,
      categoryId,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return normalizeAdminFavoriteRanking(raw);
}

export async function getAdminPeakConcurrent(
  token: string,
  date: string,
  limit = 10,
  categoryId?: number,
) {
  const raw = await requestRaw(
    `/api/admin/news/peak-concurrent-viewers${toQuery({
      date,
      limit,
      categoryId,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return normalizeAdminPeakConcurrent(raw);
}
