import { fetchPlant } from "@/lib/api";
import TerrariumViewer from "./TerrariumViewer";
import { notFound } from "next/navigation";

export default async function PlantPage({ params }) {
  const plant = await fetchPlant(params.plant_id);

  if (!plant) return notFound();

  return <TerrariumViewer plant={plant} />;
}

export function generateMetadata({ params }) {
  return {
    title: `${params.plant_id} — AMT Smart Terrarium`,
    description: "Your smart terrarium companion",
  };
}
