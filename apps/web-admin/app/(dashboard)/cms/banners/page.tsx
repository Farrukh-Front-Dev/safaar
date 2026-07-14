"use client";

import { useState } from "react";
import type { CmsBanner } from "@/types/admin";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/lib/store";

export default function CmsBannersPage() {
  const banners = useAdminStore((s) => s.cmsBanners);
  const addBanner = useAdminStore((s) => s.addBanner);
  const updateBanner = useAdminStore((s) => s.updateBanner);
  const deleteBanner = useAdminStore((s) => s.deleteBanner);
  const toggleBannerStatus = useAdminStore((s) => s.toggleBannerStatus);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CmsBanner | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    imageUrl: "",
    order: 1,
    isActive: true,
  });

  const openNewModal = () => {
    setFormData({ title: "", link: "", imageUrl: "", order: banners.length + 1, isActive: true });
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: CmsBanner) => {
    setFormData({
      title: banner.title,
      link: banner.link,
      imageUrl: banner.imageUrl,
      order: banner.order,
      isActive: banner.isActive,
    });
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.link || !formData.imageUrl) {
      toast.error("Iltimos barcha maydonlarni to'ldiring");
      return;
    }

    if (editingBanner) {
      updateBanner(editingBanner.id, formData);
      toast.success("Banner muvaffaqiyatli saqlandi!");
    } else {
      addBanner(formData);
      toast.success("Yangi banner qo'shildi!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Rostdan ham ushbu bannerni o'chirmoqchimisiz?")) {
      deleteBanner(id);
      toast.success("Banner o'chirildi");
    }
  };

  const columns: Column<CmsBanner>[] = [
    { key: "order", label: "Tartib", render: (row) => <span className="font-medium text-lg">{row.order}</span> },
    { key: "imageUrl", label: "Rasm", render: (row) => <div className="w-24 h-12 bg-[var(--bg-tertiary)] rounded flex items-center justify-center text-[10px] text-[var(--text-muted)] truncate px-1" title={row.imageUrl}><img src={row.imageUrl} alt="banner" className="w-full h-full object-cover rounded" onError={(e) => (e.currentTarget.style.display = 'none')} /></div> },
    { key: "title", label: "Sarlavha", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "link", label: "Havola (Link)", render: (row) => <span className="text-sm text-[var(--primary)] underline">{row.link}</span> },
    {
      key: "isActive",
      label: "Holat",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.isActive ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--text-muted)]/10 text-[var(--text-secondary)]"}`}>
          {row.isActive ? "Faol" : "Nofaol"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => toggleBannerStatus(row.id)} title={row.isActive ? "Nofaol qilish" : "Faol qilish"} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${row.isActive ? "text-[var(--warning)] hover:bg-[var(--warning)]/10" : "text-[var(--success)] hover:bg-[var(--success)]/10"}`}>
            <Power size={14} />
          </button>
          <button onClick={() => openEditModal(row)} className="w-8 h-8 rounded flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="w-8 h-8 rounded flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)]/10">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="flex justify-end">
          <Button size="sm" icon={<Plus size={14} />} onClick={openNewModal}>Yangi Banner</Button>
        </div>
        
        <DataTable columns={columns} data={banners} keyField="id" emptyMessage="Bannerlar topilmadi" />
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? "Bannerni tahrirlash" : "Yangi Banner"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSave}>Saqlash</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input 
            label="Sarlavha" 
            placeholder="Katta chegirmalar..." 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">Rasm (Qurilmadan yuklash)</label>
            <label className="group relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-tertiary)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--bg-secondary)] overflow-hidden">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover transition-opacity group-hover:opacity-80" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                  <span className="text-2xl opacity-50">+</span>
                  <span className="text-xs font-medium">Rasm tanlash uchun bosing</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setFormData({ ...formData, imageUrl: url });
                  }
                }}
              />
            </label>
          </div>
          <Input 
            label="Yo'naltirish havolasi (Link)" 
            placeholder="/hotels?discount=true" 
            value={formData.link} 
            onChange={(e) => setFormData({ ...formData, link: e.target.value })} 
          />
          <Input 
            type="number"
            label="Tartib raqami" 
            value={formData.order.toString()} 
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} 
          />
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Holat</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text-muted)]">Faol</span>
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
}
