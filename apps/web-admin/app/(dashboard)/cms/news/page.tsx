"use client";

import { MockApi } from "@/lib/api/mock-api";
import { CmsArticleManager } from "../_components/cms-article-manager";

export default function CmsNewsPage() {
  return (
    <CmsArticleManager
      type="news"
      title="Yangiliklar"
      addLabel="Yangilik qo'shish"
      emptyMessage="Yangiliklar topilmadi"
      loadItems={MockApi.getCmsNews}
    />
  );
}
