export interface NewsItem {
  id: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
}

const NEWS_KEY = 'news';

export const getNews = (): NewsItem[] => {
  const newsJson = localStorage.getItem(NEWS_KEY);
  return newsJson ? JSON.parse(newsJson) : [];
};

export const saveNews = (news: NewsItem[]) => {
  localStorage.setItem(NEWS_KEY, JSON.stringify(news));
};

export const addNews = (newsItem: Omit<NewsItem, 'id'>): NewsItem => {
  const news = getNews();
  const newNewsItem: NewsItem = {
    ...newsItem,
    id: Date.now().toString(),
  };
  news.push(newNewsItem);
  saveNews(news);
  return newNewsItem;
};

export const updateNews = (id: string, updatedFields: Partial<Omit<NewsItem, 'id'>>): NewsItem | null => {
  const news = getNews();
  const index = news.findIndex(item => item.id === id);
  if (index === -1) return null;
  const updatedItem = { ...news[index], ...updatedFields };
  news[index] = updatedItem;
  saveNews(news);
  return updatedItem;
};

export const deleteNews = (id: string): boolean => {
  const news = getNews();
  const newNews = news.filter(item => item.id !== id);
  if (newNews.length === news.length) return false;
  saveNews(newNews);
  return true;
};