import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  getNews,
  deleteNews,
  type NewsItem,
  updateNews,
} from "../lib/newsLocalStorage";
import { Checkbox } from "./ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
} from "./ui/pagination";

type SortOption = "date-newest" | "date-oldest" | "title" | "pinned";

const extractTextFromContent = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const NewsList = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setNews(getNews());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this news?")) {
      if (deleteNews(id)) {
        setNews(getNews());
      }
    }
  };

  const togglePinned = (id: string, isPinned: boolean) => {
    if (updateNews(id, { isPinned })) {
      setNews((prevNews) =>
        prevNews.map((item) => (item.id === id ? { ...item, isPinned } : item))
      );
    }
  };

  // Фильтрация и сортировка
  const filteredNews = news.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNews = [...filteredNews];
  if (sortBy === "date-newest") {
    sortedNews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === "date-oldest") {
    sortedNews.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else if (sortBy === "title") {
    sortedNews.sort((a, b) => {
      const textA = extractTextFromContent(a.content);
      const textB = extractTextFromContent(b.content);
      return textA.localeCompare(textB);
    });
  } else if (sortBy === "pinned") {
    sortedNews.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // Пагинация
  const totalItems = sortedNews.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentNews = sortedNews.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (startPage > 1) {
        if (startPage > 2) pages.unshift(-1);
        pages.unshift(1);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button asChild className="text-white">
          <Link to="/editor">+ Add new post</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search news content..."
          className="flex-grow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-newest">
              Sort by date (newest first)
            </SelectItem>
            <SelectItem value="date-oldest">
              Sort by date (oldest first)
            </SelectItem>
            <SelectItem value="title">Sort by content</SelectItem>
            <SelectItem value="pinned">Sort by pinned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[40%]">News Title</TableHead>
              <TableHead>Date posted</TableHead>
              <TableHead>Pin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentNews.length > 0 ? (
              currentNews.map((newsItem) => (
                <TableRow key={newsItem.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium max-w-[300px]">
                    <div className="truncate">
                      {extractTextFromContent(newsItem.content)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(newsItem.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={newsItem.isPinned}
                      onCheckedChange={(checked) =>
                        togglePinned(newsItem.id, checked as boolean)
                      }
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/editor/${newsItem.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(newsItem.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  No news found. Create your first news post!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      <div className="flex pt-6 justify-between">
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage - 1);
                    }}
                    isActive={currentPage > 1}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === -1 ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPage(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(currentPage + 1);
                    }}
                    isActive={currentPage < totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="flex items-center gap-4 ml-auto">
          <div className="text-sm text-gray-500">
            Results {startIndex + 1} to {endIndex} of {totalItems}
          </div>

          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Show" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default NewsList;
