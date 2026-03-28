export interface UserInfo {
  id: number;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  gender?: string | null;
  bio?: string | null;
  phone?: string | null;
  createdAt?: string | null;
}

export interface AuthSession {
  token: string;
  userInfo: UserInfo;
}

export interface AdminInfo {
  id: number;
  username: string;
  nickname?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
}

export interface AdminSession {
  token: string;
  adminInfo: AdminInfo;
}

export interface Category {
  id: number;
  name: string;
  sortOrder?: number;
}

export interface NewsItem {
  id: number;
  title: string;
  description?: string | null;
  content?: string | null;
  image?: string | null;
  author?: string | null;
  categoryId: number;
  views: number;
  publishedTime?: string | null;
  favoriteCount?: number;
  favoriteId?: number;
  favoriteTime?: string | null;
  historyId?: number;
  viewTime?: string | null;
}

export interface NewsListData {
  items: NewsItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NewsDetailData {
  detail: NewsItem;
  related: NewsItem[];
}

export interface FavoriteCheckData {
  isFavorite: boolean;
}

export interface FavoriteListData {
  list: NewsItem[];
  total: number;
  hasMore: boolean;
}

export interface HistoryListData {
  list: NewsItem[];
  total: number;
  hasMore: boolean;
}

export interface AdminUserItem {
  id: number;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  gender?: string | null;
  bio?: string | null;
  phone?: string | null;
  createdAt?: string | null;
}

export interface AdminUserListData {
  list: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AdminNewsListData {
  list: NewsItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AdminLoginStreakItem {
  userId: number;
  username: string;
  nickname?: string | null;
  streakDays: number;
  lastLoginDate?: string | null;
}

export interface AdminLoginStreakData {
  days: number;
  list: AdminLoginStreakItem[];
  total: number;
}

export interface AdminFavoriteRankingItem {
  newsId: number;
  title: string;
  categoryId: number;
  views: number;
  publishedTime?: string | null;
  favoriteCount: number;
}

export interface AdminFavoriteRankingData {
  list: AdminFavoriteRankingItem[];
  limit: number;
}

export interface AdminPeakConcurrentItem {
  newsId: number;
  title: string;
  categoryId: number;
  statDate: string;
  peakConcurrentViewers: number;
  peakTime?: string | null;
}

export interface AdminPeakConcurrentData {
  date: string;
  list: AdminPeakConcurrentItem[];
  total: number;
  limit: number;
}

export interface UserProfileUpdatePayload {
  nickname?: string | null;
  avatar?: string | null;
  gender?: string | null;
  bio?: string | null;
  phone?: string | null;
}
