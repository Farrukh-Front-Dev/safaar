"use client";

import { MockApi } from "@/lib/api/mock-api";
import { CmsArticleManager } from "../_components/cms-article-manager";

export default function CmsOffersPage() {
  return (
    <CmsArticleManager
      type="offer"
      title="Maxsus takliflar"
      addLabel="Taklif qo'shish"
      emptyMessage="Takliflar topilmadi"
      loadItems={MockApi.getCmsNews}
    />
  );
}
