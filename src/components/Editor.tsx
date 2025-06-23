import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { getNews, addNews, updateNews } from "../lib/newsLocalStorage";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";
import contentDefault from "@/components/tiptap-templates/simple/data/content.json";
import { convertJsonToHtml } from "@/utils/convertJsonToHtml";

export const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const newsItem = getNews().find((item) => item.id === id);
      if (newsItem) {
        setContent(newsItem.content);
        setIsPinned(newsItem.isPinned);
      }
    } else {
      setContent(convertJsonToHtml(contentDefault));
    }
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);

    // Имитация сетевой задержки
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newsData = {
      content,
      isPinned,
      createdAt: id
        ? getNews().find((item) => item.id === id)!.createdAt
        : new Date().toISOString(),
    };

    if (id) {
      updateNews(id, newsData);
    } else {
      addNews(newsData);
    }

    setIsSaving(false);
    navigate("/");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="hover:underline flex items-center">
          ← Add new post
        </Link>
      </div>

      <div className="p-6 border border-dashed border-[#919191] rounded-xl min-h-0">
        <SimpleEditor value={content} onChange={setContent} />
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" asChild>
          <Link to="/">Schedule message</Link>
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="">
          {isSaving ? "Saving..." : "Post now"}
        </Button>
      </div>
    </div>
  );
};
