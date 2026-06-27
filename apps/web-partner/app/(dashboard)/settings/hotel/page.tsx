import { Save } from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "../../../_components/ui/card";
import { Input } from "../../../_components/ui/input";
import { Button } from "../../../_components/ui/button";
import { Label } from "../../../_components/ui/label";
import { PageHeader } from "../../../_components/layout/page-header";

export default function HotelSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Sozlamalar"
        title="Mehmonxona profili"
        description="Asosiy ma'lumotlar, manzil va aloqa."
      />

      <Card>
        <CardHeader>
          <CardTitle>Asosiy ma'lumotlar</CardTitle>
        </CardHeader>
        <CardBody>
          <form className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Mehmonxona nomi</Label>
              <Input id="name" defaultValue="Hotel Samarkand Plaza" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inn">INN</Label>
              <Input id="inn" defaultValue="304567890" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Resepsiyon telefoni</Label>
              <Input id="phone" type="tel" defaultValue="+998 66 333 22 11" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="reception@hotelsamarkand.uz"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="address">Manzil</Label>
              <Input
                id="address"
                defaultValue="Samarqand sh., Registon ko'chasi, 5"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">
                <Save className="h-4 w-4" aria-hidden />
                Saqlash
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
