import React from "react";
import { getInventoryEquipmentAction } from "@/app/(HaaS)/equipment/actions";
import { ServerCrash } from "lucide-react";
import { InventoryClient, InventoryDevice } from "./InventoryClient";

export default async function InventoryPage() {
  const result = await getInventoryEquipmentAction();

  if (!result.success || !result.data) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 text-red-500">
          <ServerCrash className="h-8 w-8" />
          <h2 className="text-xl font-semibold">Erro ao carregar inventário</h2>
        </div>
        <p className="mt-2 text-slate-500">{result.error}</p>
      </div>
    );
  }

  const devices = result.data as unknown as InventoryDevice[];

  return (
    <div className="flex-1 space-y-8 p-8">


      <InventoryClient devices={devices} />
    </div>
  );
}