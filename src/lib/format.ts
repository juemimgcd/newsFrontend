import type { Category } from "../types";

export function formatDateTime(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: options?.timeStyle ?? "short",
    ...options,
  }).format(date);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPhone(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return value;
}

export function getCategoryName(categories: Category[], categoryId: number) {
  return categories.find((category) => category.id === categoryId)?.name ?? `Category #${categoryId}`;
}

export function excerpt(text?: string | null, length = 140) {
  if (!text) {
    return "No description is available for this item yet.";
  }

  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length).trim()}...`;
}

export function splitArticleContent(text?: string | null) {
  if (!text) {
    return [];
  }

  return text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
