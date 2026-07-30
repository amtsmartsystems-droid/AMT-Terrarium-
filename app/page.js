import { redirect } from "next/navigation";

// Demo redirect → goes directly to mock plant
export default function HomePage() {
  redirect("/TRM-102");
}
