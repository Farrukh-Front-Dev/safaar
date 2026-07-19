"use client";

import { MockApi } from "@/lib/api/mock-api";
import { CmsArticleManager } from "../_components/cms-article-manager";

export default function CmsPagesPage() {
  return (
    <CmsArticleManager
      type="page"
      title="Statik sahifalar"
      addLabel="Sahifa qo'shish"
      emptyMessage="Sahifalar topilmadi"
      loadItems={MockApi.getCmsPages}
    />
  );
}
