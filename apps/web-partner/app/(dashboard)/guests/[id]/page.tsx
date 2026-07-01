import { GuestDetailView } from "./detail-view";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuestDetailView id={id} />;
}
