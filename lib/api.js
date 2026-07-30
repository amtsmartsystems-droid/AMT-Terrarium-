const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchPlant(plant_id) {
  try {
    const res = await fetch(`${API_URL}/plants/${plant_id}`, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch plant:", err);
    return null;
  }
}

export async function openHiddenGift(plant_id) {
  try {
    const res = await fetch(`${API_URL}/plants/${plant_id}/gift/open`, {
      method: "POST",
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to open gift:", err);
    return false;
  }
}
