import { ReservationDetailView } from "./detail-view";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReservationDetailView id={id} />;
}
