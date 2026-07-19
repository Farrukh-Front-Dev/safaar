"use client";

import { useState, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import {
  Mail,
  MessageSquare,
  Plus,
  Edit2,
  Play,
  Trash2,
  Send,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface CmsTemplate {
  id: string;
  name: string;
  type: "email" | "sms";
  code: string;
  description: string;
  subject?: string;
  body: string;
  isActive: boolean;
  variables: string[];
  lastModified: string;
}

const INITIAL_TEMPLATES: CmsTemplate[] = [
  {
    id: "T-1",
    name: "SMS OTP Tasdiqlash",
    type: "sms",
    code: "auth_otp_sms",
    description: "Foydalanuvchini ro'yxatdan o'tish yoki kirish uchun SMS tasdiqlash kodi",
    body: "Safaar: Sizning kirish kodingiz: {otp}. Bu kodni hech kimga bermang.",
    isActive: true,
    variables: ["otp"],
    lastModified: "2026-07-01T12:00:00Z"
  },
  {
    id: "T-2",
    name: "Bron tasdiqlandi (SMS)",
    type: "sms",
    code: "booking_confirmed_sms",
    description: "Mijozga bron muvaffaqiyatli yakunlanganligi haqida SMS xabarnoma",
    body: "Hurmatli {customerName}, sizning {serviceName} uchun broningiz tasdiqlandi. ID: {bookingId}. Boshlanish vaqti: {dateTime}. Rahmat!",
    isActive: true,
    variables: ["customerName", "serviceName", "bookingId", "dateTime"],
    lastModified: "2026-07-03T15:30:00Z"
  },
  {
    id: "T-3",
    name: "Bron bekor qilindi (SMS)",
    type: "sms",
    code: "booking_cancelled_sms",
    description: "Bron bekor qilinganda mijozga yuboriladigan SMS xabarnoma",
    body: "Hurmatli {customerName}, sizning {bookingId} raqamli broningiz bekor qilindi. To'lovingiz 24 soat ichida qaytariladi.",
    isActive: true,
    variables: ["customerName", "bookingId"],
    lastModified: "2026-07-04T10:15:00Z"
  },
  {
    id: "T-4",
    name: "Hamkor arizasi tasdiqlandi (Email)",
    type: "email",
    code: "partner_approved_email",
    description: "Hamkor arizasi tasdiqlanganda emailga yuboriladigan xat",
    subject: "Safaar: Hamkorlik arizangiz tasdiqlandi! 🎉",
    body: "Hurmatli {partnerName},\n\nSafaar platformasiga yuborgan hamkorlik arizangiz muvaffaqiyatli tasdiqlandi.\nEndi siz o'z parolingiz bilan partner.safaar.uz paneliga kirib, xizmatlaringizni joylashtirishingiz mumkin.\n\nSizga omadli faoliyat tilaymiz!\n\nHurmat bilan,\nSafaar Jamoasi",
    isActive: true,
    variables: ["partnerName"],
    lastModified: "2026-07-05T09:00:00Z"
  },
  {
    id: "T-5",
    name: "Mijoz uchun xush kelibsiz xati (Email)",
    type: "email",
    code: "customer_welcome_email",
    description: "Mijoz ro'yxatdan o'tganda yuboriladigan xush kelibsiz xati",
    subject: "Safaar.uz platformasiga xush kelibsiz!",
    body: "Assalomu alaykum {customerName},\n\nSafaar platformasida ro'yxatdan o'tganingizdan xursandmiz. Biz bilan O'zbekiston bo'ylab eng yaxshi mehmonxonalar va qulay avtobus reyslarini oson va tez bron qiling!\n\nSizga yoqimli sayohatlar tilaymiz!\n\nHurmat bilan,\nSafaar Development Team",
    isActive: true,
    variables: ["customerName"],
    lastModified: "2026-07-06T14:45:00Z"
  }
];

export default function CmsTemplatesPage() {
  const [templates, setTemplates] = useState<CmsTemplate[]>(INITIAL_TEMPLATES);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  // Active editing template
  const [editingTemplate, setEditingTemplate] = useState<CmsTemplate | null>(null);
  const [testTemplate, setTestTemplate] = useState<CmsTemplate | null>(null);
  
  // Test variables input state
  const [testVars, setTestVars] = useState<Record<string, string>>({});
  
  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, isActive: !currentStatus, lastModified: new Date().toISOString() } : t))
    );
    showToast(`Shablon holati ${!currentStatus ? "faollashtirildi" : "faolsizlantirildi"}`);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Haqiqatan ham ushbu shablonni o'chirmoqchimisiz?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      showToast("Shablon muvaffaqiyatli o'chirildi", "info");
    }
  };

  // Open modal to create a template
  const handleOpenCreateModal = () => {
    setEditingTemplate({
      id: `T-${templates.length + 1}`,
      name: "",
      type: "sms",
      code: "",
      description: "",
      body: "",
      isActive: true,
      variables: [],
      lastModified: new Date().toISOString()
    });
    setIsEditModalOpen(true);
  };

  // Open modal to edit a template
  const handleOpenEditModal = (template: CmsTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditModalOpen(true);
  };

  // Open test / preview modal
  const handleOpenTestModal = (template: CmsTemplate) => {
    setTestTemplate(template);
    
    // Parse variables dynamically and initialize test inputs
    const variables = getVariablesInText(template.body);
    const initialVars: Record<string, string> = {};
    variables.forEach(v => {
      if (v === "otp") initialVars[v] = Math.floor(100000 + Math.random() * 900000).toString();
      else if (v === "customerName" || v === "partnerName") initialVars[v] = "Ali Valiyev";
      else if (v === "bookingId") initialVars[v] = "UB-2026-9912";
      else if (v === "serviceName") initialVars[v] = "Samarkand Plaza Hotel Suite";
      else if (v === "dateTime") initialVars[v] = "08.07.2026, 14:00";
      else initialVars[v] = `[${v}]`;
    });
    setTestVars(initialVars);
    setIsTestModalOpen(true);
  };

  // Save template edits
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name.trim() || !editingTemplate.code.trim() || !editingTemplate.body.trim()) {
      showToast("Iltimos, barcha majburiy maydonlarni to'ldiring!", "error");
      return;
    }

    // Auto-update variables array from the body text
    const parsedVars = getVariablesInText(editingTemplate.body);
    const updatedTemplate = {
      ...editingTemplate,
      variables: parsedVars,
      lastModified: new Date().toISOString()
    };

    setTemplates(prev => {
      const exists = prev.some(t => t.id === updatedTemplate.id);
      if (exists) {
        return prev.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t));
      } else {
        return [...prev, updatedTemplate];
      }
    });

    setIsEditModalOpen(false);
    setEditingTemplate(null);
    showToast("Shablon muvaffaqiyatli saqlandi!");
  };

  // Parse {variable_name} inside text
  const getVariablesInText = (text: string): string[] => {
    const matches = text.match(/\{([a-zA-Z0-9_]+)\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, ""))));
  };

  // Render text with variables replaced
  const renderTemplateText = (bodyText: string, values: Record<string, string>) => {
    return bodyText.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
  };

  // Insert variable tag into body at cursor
  const handleInsertVariable = (v: string) => {
    if (!editingTemplate) return;
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingTemplate.body;
    
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newBody = before + `{${v}}` + after;
    
    setEditingTemplate({
      ...editingTemplate,
      body: newBody
    });

    // Refocus and place cursor after inserted tag
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + v.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleSendTestMessage = () => {
    showToast("Test xabari muvaffaqiyatli yuborildi!");
    setIsTestModalOpen(false);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesTab = activeTab === "all" || t.type === activeTab;
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 p-1 animate-fade-in">
      
      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl bg-white animate-[slideUp_200ms_ease-out]"
          style={{ borderColor: toast.type === "success" ? "var(--success)" : toast.type === "error" ? "var(--danger)" : "var(--info)" }}>
          {toast.type === "success" ? (
            <CheckCircle className="text-[var(--success)] w-5 h-5 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="text-[var(--danger)] w-5 h-5 shrink-0" />
          ) : (
            <Info className="text-[var(--info)] w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium text-[var(--text-primary)]">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Xabarnoma shablonlari</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Tizim orqali mijozlar va hamkorlarga yuboriladigan SMS hamda Email shablonlarini tahrirlash va test qilish.
          </p>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={handleOpenCreateModal}>
          Yangi shablon
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <Card padding="sm" className="bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs Filter */}
          <div className="flex gap-1.5 p-1 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)] max-w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "email"
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Mail size={12} /> Email
              </span>
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "sms"
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare size={12} /> SMS
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-[320px]">
            <Input
              placeholder="Qidirish (Nomi, kod yoki izoh)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

        </div>
      </Card>

      {/* Templates List */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Kod va Nomi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Turi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tavsifi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">O&apos;zgaruvchilar</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Holat</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[var(--text-primary)] text-sm">{template.name}</span>
                      <span className="font-mono text-xs text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-0.5 rounded max-w-fit">{template.code}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      template.type === "email" ? "bg-[var(--info)]/10 text-[var(--info)]" : "bg-[var(--purple)]/10 text-[var(--purple)]"
                    }`}>
                      {template.type === "email" ? <Mail size={12} /> : <MessageSquare size={12} />}
                      {template.type === "email" ? "Email" : "SMS"}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-[300px]">
                    <span className="text-xs text-[var(--text-secondary)] line-clamp-2">{template.description}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-[var(--text-secondary)] font-mono">
                      {template.variables.length > 0
                        ? template.variables.map((v) => `{${v}}`).join(", ")
                        : <span className="italic">yo'q</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleActive(template.id, template.isActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        template.isActive ? "bg-[var(--success)]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          template.isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      
                      {/* Test Action */}
                      <button
                        onClick={() => handleOpenTestModal(template)}
                        title="Test qilish va Preview"
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--info)] hover:bg-[var(--info)]/5 transition-all"
                      >
                        <Play size={16} />
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => handleOpenEditModal(template)}
                        title="Tahrirlash"
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        title="O'chirish"
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/5 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[var(--text-muted)]">
                  Qidiruv bo&apos;yicha hech qanday shablon topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ────────────────── Edit/Create Template Modal ────────────────── */}
      {editingTemplate && (
        <Modal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTemplate(null);
          }}
          title={editingTemplate.code ? "Shablonni tahrirlash" : "Yangi shablon yaratish"}
          size="lg"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTemplate(null);
                }}
              >
                Bekor qilish
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleSaveTemplate}
              >
                Saqlash
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Shablon nomi (majburiy)"
                placeholder="Masalan: SMS OTP Tasdiqlash"
                value={editingTemplate.name}
                onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                className="w-full"
              />
              <Input
                label="Unikal kod (majburiy)"
                placeholder="Masalan: auth_otp_sms"
                value={editingTemplate.code}
                onChange={e => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                className="w-full text-sm font-mono"
                disabled={!!templates.find(t => t.id === editingTemplate.id)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  Xabarnoma turi
                </label>
                <select
                  value={editingTemplate.type}
                  onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value as "email" | "sms" })}
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2 bg-white text-sm focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="sms">SMS xabarnoma</option>
                  <option value="email">Email xabarnoma</option>
                </select>
              </div>
              <div className="flex items-center gap-3 h-10">
                <input
                  type="checkbox"
                  id="template-active-checkbox"
                  checked={editingTemplate.isActive}
                  onChange={e => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                  className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="template-active-checkbox" className="text-sm font-medium text-[var(--text-primary)] cursor-pointer">
                  Faol holatda saqlash
                </label>
              </div>
            </div>

            <Input
              label="Qisqacha tavsif (ichki foydalanish uchun)"
              placeholder="Ushbu shablon qachon va kimga yuborilishi haqida ma'lumot..."
              value={editingTemplate.description}
              onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
              className="w-full"
            />

            {/* Subject Field (Email only) */}
            {editingTemplate.type === "email" && (
              <Input
                label="Email mavzusi (Subject)"
                placeholder="Xat mavzusini kiriting..."
                value={editingTemplate.subject || ""}
                onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                className="w-full"
              />
            )}

            {/* Template Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Xabarnoma matni (Body)
                </label>
              </div>
              
              {/* Variable shortcut buttons */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-[var(--text-muted)] flex items-center">Tezkor kiritish:</span>
                {["otp", "customerName", "partnerName", "bookingId", "serviceName", "dateTime"].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleInsertVariable(v)}
                    className="text-[11px] font-mono text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    {`{${v}}`}
                  </button>
                ))}
              </div>

              <textarea
                id="template-body"
                ref={bodyTextareaRef}
                rows={editingTemplate.type === "email" ? 8 : 4}
                value={editingTemplate.body}
                onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                placeholder="Xabar matnini yozing. O'zgaruvchilar kiritish uchun yuqoridagi tugmalardan foydalaning..."
                className="w-full rounded-b-xl border border-[var(--border)] p-3 text-sm font-mono focus:border-[var(--primary)] focus:outline-none resize-y"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Diqqat: `{`{o'zgaruvchi_nomi}`}` formatidagi matnlar jo'natish vaqtida avtomatik ravishda mos keluvchi qiymatlar bilan almashtiriladi.
              </p>
            </div>

          </div>
        </Modal>
      )}

      {/* ────────────────── Test & Live Preview Modal ────────────────── */}
      {testTemplate && (
        <Modal
          open={isTestModalOpen}
          onClose={() => {
            setIsTestModalOpen(false);
            setTestTemplate(null);
          }}
          title={`Shablonni test qilish: ${testTemplate.name}`}
          size="xl"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsTestModalOpen(false);
                  setTestTemplate(null);
                }}
              >
                Yopish
              </Button>
              <Button
                variant="accent"
                size="sm"
                icon={<Send size={14} />}
                onClick={handleSendTestMessage}
              >
                Test xabarini yuborish
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
            
            {/* Left Side: Mock values inputs */}
            <div className="flex flex-col gap-5 border-r border-[var(--border)] pr-0 lg:pr-6">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">1. Sinov qiymatlarini kiriting</h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Quyidagi o&apos;zgaruvchilarga matn kiriting va o&apos;ng tomonda xabarnomaning tayyor holatini ko&apos;ring.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {getVariablesInText(testTemplate.body).length > 0 ? (
                  getVariablesInText(testTemplate.body).map(v => (
                    <div key={v} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                        {`{${v}}`}
                      </label>
                      <Input
                        placeholder={`Masalan: Ali...`}
                        value={testVars[v] || ""}
                        onChange={e => setTestVars({ ...testVars, [v]: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] flex items-center gap-3">
                    <Info className="text-[var(--text-muted)] w-5 h-5" />
                    <span className="text-xs text-[var(--text-secondary)]">Ushbu shablonda hech qanday o&apos;zgaruvchilar aniqlanmadi.</span>
                  </div>
                )}
              </div>

              {testTemplate.type === "email" && (
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                    Test jo&apos;natiladigan email manzili
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="admin@safaar.uz"
                      defaultValue="admin@safaar.uz"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {testTemplate.type === "sms" && (
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                    Test jo&apos;natiladigan telefon raqami
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="+998 (90) 123-45-67"
                      defaultValue="+998901234567"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Live preview */}
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">2. Yakuniy matn</h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Xabarnomaning qabul qiluvchiga boradigan sodda ko&apos;rinishi.
                </p>
              </div>

              <div className="flex flex-col border border-[var(--border)] rounded-xl overflow-hidden bg-white grow">
                {testTemplate.type === "email" && (
                  <div className="bg-[var(--bg-tertiary)] border-b border-[var(--border)] px-4 py-3 text-sm flex gap-2">
                    <span className="font-semibold text-[var(--text-muted)]">Mavzu:</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {renderTemplateText(testTemplate.subject || "", testVars)}
                    </span>
                  </div>
                )}
                
                <div className="p-5 text-sm text-[var(--text-primary)] font-sans leading-relaxed whitespace-pre-wrap grow bg-[var(--bg-secondary)]/30">
                  {renderTemplateText(testTemplate.body, testVars)}
                </div>
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
}
