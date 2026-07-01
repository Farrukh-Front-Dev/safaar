"use client";

import {
  Baby,
  Calendar,
  Cigarette,
  Dog,
  FileText,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import { SectionCard } from "./_components/section-card";
import { Hero } from "./_components/hero";
import { PreviewDrawer } from "./_components/preview-drawer";
import { GeneralEditor } from "./_editors/general-editor";
import { PhotosEditor } from "./_editors/photos-editor";
import { AmenitiesEditor } from "./_editors/amenities-editor";
import { LocationEditor } from "./_editors/location-editor";
import { RulesEditor } from "./_editors/rules-editor";
import {
  AMENITY_GROUPS,
  CANCELLATION_POLICY_INFO,
} from "../../_lib/domain/listing";
import { useListing } from "../../_hooks/use-listing";

const AMENITY_LABEL = new Map<string, string>();
for (const g of AMENITY_GROUPS) {
  for (const it of g.items) AMENITY_LABEL.set(it.id, it.label);
}

type OpenEditor =
  | "general"
  | "photos"
  | "amenities"
  | "location"
  | "rules"
  | null;

export function ListingOverview() {
  const { data: l } = useListing();
  const [openEditor, setOpenEditor] = useState<OpenEditor>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Har bo'lim statusi
  const generalOk =
    l.name.trim().length >= 3 &&
    l.shortDescription.trim().length >= 20 &&
    l.fullDescription.trim().length >= 100;
  const photosOk = l.photos.length >= 3;
  const amenitiesOk = l.amenities.length >= 3;
  const locationOk = Boolean(l.address.trim()) && l.nearby.length > 0;
  const rulesOk = Boolean(l.checkInTime && l.checkOutTime);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <Hero onPreview={() => setPreviewOpen(true)} />

      {/* Sections grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          icon={<FileText className="h-5 w-5" aria-hidden />}
          title="Umumiy ma'lumotlar"
          subtitle="Nomi, tavsif, yulduzlar"
          status={generalOk ? "complete" : "incomplete"}
          onEdit={() => setOpenEditor("general")}
          preview={
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-semibold">{l.name || "—"}</span>
                <span className="inline-flex">
                  {Array.from({ length: l.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-amber-400 stroke-amber-500"
                      aria-hidden
                    />
                  ))}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-[var(--muted-foreground)]">
                {l.shortDescription || "Qisqa tavsif to'ldirilmagan"}
              </p>
            </div>
          }
        />

        <SectionCard
          icon={<ImageIcon className="h-5 w-5" aria-hidden />}
          title="Rasmlar"
          subtitle={`${l.photos.length} ta rasm`}
          status={photosOk ? "complete" : "incomplete"}
          onEdit={() => setOpenEditor("photos")}
          preview={
            l.photos.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">
                Rasm yo'q — kamida 3 tasi kerak
              </p>
            ) : (
              <div className="flex gap-1.5">
                {l.photos
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .slice(0, 5)
                  .map((p) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={p.id}
                      src={p.url}
                      alt=""
                      className="h-14 w-20 rounded-md object-cover"
                    />
                  ))}
                {l.photos.length > 5 && (
                  <div className="flex h-14 w-20 items-center justify-center rounded-md bg-[var(--surface-muted)] text-xs font-semibold text-[var(--muted-foreground)]">
                    +{l.photos.length - 5}
                  </div>
                )}
              </div>
            )
          }
        />

        <SectionCard
          icon={<Sparkles className="h-5 w-5" aria-hidden />}
          title="Qulayliklar"
          subtitle={`${l.amenities.length} ta belgilangan`}
          status={amenitiesOk ? "complete" : "incomplete"}
          onEdit={() => setOpenEditor("amenities")}
          preview={
            l.amenities.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">
                Belgilanmagan
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {l.amenities.slice(0, 6).map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px]"
                  >
                    {AMENITY_LABEL.get(a) ?? a}
                  </span>
                ))}
                {l.amenities.length > 6 && (
                  <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                    +{l.amenities.length - 6}
                  </span>
                )}
              </div>
            )
          }
        />

        <SectionCard
          icon={<MapPin className="h-5 w-5" aria-hidden />}
          title="Joylashuv"
          subtitle={l.city}
          status={locationOk ? "complete" : "incomplete"}
          onEdit={() => setOpenEditor("location")}
          preview={
            l.nearby.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">
                Yaqin joylar qo'shilmagan
              </p>
            ) : (
              <div className="flex flex-col gap-0.5 text-xs text-[var(--muted-foreground)]">
                {l.nearby.slice(0, 3).map((n) => (
                  <span key={n.id}>
                    · {n.name}{" "}
                    <span className="text-[10px]">{n.distance}</span>
                  </span>
                ))}
                {l.nearby.length > 3 && (
                  <span className="text-[10px]">
                    +{l.nearby.length - 3} boshqa
                  </span>
                )}
              </div>
            )
          }
        />

        <SectionCard
          icon={<Calendar className="h-5 w-5" aria-hidden />}
          title="Uy qoidalari"
          subtitle={`Check-in ${l.checkInTime} · Check-out ${l.checkOutTime}`}
          status={rulesOk ? "complete" : "incomplete"}
          onEdit={() => setOpenEditor("rules")}
          className="md:col-span-2"
          preview={
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[var(--muted-foreground)]">
                Bekor qilish:{" "}
                <strong className="text-[var(--foreground)]">
                  {CANCELLATION_POLICY_INFO[l.cancellationPolicy].label}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <Baby
                  className={
                    l.childrenAllowed
                      ? "h-3.5 w-3.5 text-accent-600"
                      : "h-3.5 w-3.5 text-zinc-300"
                  }
                  aria-hidden
                />
                Bolalar
              </span>
              <span className="inline-flex items-center gap-1">
                <Dog
                  className={
                    l.petsAllowed
                      ? "h-3.5 w-3.5 text-accent-600"
                      : "h-3.5 w-3.5 text-zinc-300"
                  }
                  aria-hidden
                />
                Hayvonlar
              </span>
              <span className="inline-flex items-center gap-1">
                <Cigarette
                  className={
                    l.smokingAllowed
                      ? "h-3.5 w-3.5 text-accent-600"
                      : "h-3.5 w-3.5 text-zinc-300"
                  }
                  aria-hidden
                />
                Chekish
              </span>
              {l.extraFees.length > 0 && (
                <span className="text-[var(--muted-foreground)]">
                  · {l.extraFees.length} qo'shimcha to'lov
                </span>
              )}
            </div>
          }
        />
      </div>

      {/* Editors */}
      <GeneralEditor
        open={openEditor === "general"}
        onClose={() => setOpenEditor(null)}
      />
      <PhotosEditor
        open={openEditor === "photos"}
        onClose={() => setOpenEditor(null)}
      />
      <AmenitiesEditor
        open={openEditor === "amenities"}
        onClose={() => setOpenEditor(null)}
      />
      <LocationEditor
        open={openEditor === "location"}
        onClose={() => setOpenEditor(null)}
      />
      <RulesEditor
        open={openEditor === "rules"}
        onClose={() => setOpenEditor(null)}
      />

      {/* Preview */}
      <PreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
