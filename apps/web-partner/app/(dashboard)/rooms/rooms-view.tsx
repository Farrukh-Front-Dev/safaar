"use client";

import { BedDouble, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "../../_components/layout/page-header";
import { useRooms } from "../../_hooks/use-rooms";
import { useRoomTypes } from "../../_hooks/use-room-types";
import { type Room, type RoomType } from "../../_lib/domain/types";
import { RoomDialog } from "../settings/rooms/_dialogs/room-dialog";
import { Button } from "../../_components/ui/button";
import { formatMoney } from "../../_lib/utils/format";

export function RoomsView() {
  const { data: rooms } = useRooms();
  const { data: roomTypes } = useRoomTypes();
  const [addingRoom, setAddingRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Qavatlar bo'yicha guruhlash
  const floors = useMemo(() => {
    const map = new Map<number, Room[]>();
    rooms.forEach(room => {
      if (!map.has(room.floor)) {
        map.set(room.floor, []);
      }
      map.get(room.floor)!.push(room);
    });

    // Qavatlarni o'sish tartibida (1, 2, 3...) va xonalarni raqami bo'yicha tartiblash
    const sortedFloors = Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([floor, floorRooms]) => {
        return {
          floor,
          rooms: floorRooms.sort((a, b) => a.number.localeCompare(b.number))
        };
      });

    return sortedFloors;
  }, [rooms]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Operatsion"
          title="Xonalar Xaritasi (Room Map)"
          description="Mehmonxonadagi barcha xonalarning qavatma-qavat joylashuvi va xususiyatlari."
        />
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setAddingRoom(true)}>
            <BedDouble className="mr-2 h-4 w-4" />
            Yangi xona qo'shish
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {floors.map(({ floor, rooms }) => (
          <section key={floor} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{floor}-Qavat</h2>
              <span className="text-sm font-medium text-zinc-500">{rooms.length} ta xona</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {rooms.map(room => {
                const roomType = roomTypes.find(t => t.id === room.roomTypeId);
                return (
                  <button
                    key={room.id}
                    className="text-left"
                    onClick={() => setEditingRoom(room)}
                  >
                    <RoomCard room={room} roomType={roomType} />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <RoomDialog 
        open={addingRoom} 
        onClose={() => setAddingRoom(false)} 
        editing={null} 
      />
      
      <RoomDialog
        open={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        editing={editingRoom}
      />
    </div>
  );
}

function RoomCard({ room, roomType }: { room: Room; roomType?: RoomType }) {
  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 dark:border-zinc-800 dark:bg-[var(--surface-muted)]">
      <div className="flex items-start justify-between">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
          {room.number}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
          <BedDouble className="h-4 w-4" />
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
          {room.roomTypeName}
        </span>
        
        <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {roomType?.capacity || "?"} kishi
          </span>
          {roomType?.bedType && (
            <span className="flex items-center gap-1 text-zinc-400">
              · {roomType.bedType}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        <span className="text-[11px] font-medium text-[var(--muted-foreground)]">1 kechaga:</span>
        <div className="font-semibold text-brand-700 dark:text-brand-300 mt-0.5">
          {roomType ? formatMoney(roomType.basePrice) : "—"}
        </div>
      </div>
    </div>
  );
}
