import { Link } from "react-router-dom";
import type { Category, NewsItem } from "../types";
import { excerpt, formatCompactNumber, formatDateTime, getCategoryName } from "../lib/format";

interface NewsCardProps {
  item: NewsItem;
  categories: Category[];
  secondaryMeta?: string;
}

export function NewsCard({ item, categories, secondaryMeta }: NewsCardProps) {
  return (
    <article className="news-card">
      <div className="news-card__media">
        {item.image ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <div className="news-card__placeholder">
            <span>{getCategoryName(categories, item.categoryId)}</span>
          </div>
        )}
      </div>
      <div className="news-card__body">
        <div className="news-card__meta">
          <span className="capsule">{getCategoryName(categories, item.categoryId)}</span>
          <span>{formatCompactNumber(item.views)} views</span>
        </div>
        <h3>{item.title}</h3>
        <p>{excerpt(item.description || item.content)}</p>
        <div className="news-card__footer">
          <div>
            <small>{item.author || "Desk contributor"}</small>
            <small>{secondaryMeta || formatDateTime(item.publishedTime)}</small>
          </div>
          <Link className="ghost-button ghost-button--outlined" to={`/app/news/${item.id}`}>
            Read story
          </Link>
        </div>
      </div>
    </article>
  );
}
