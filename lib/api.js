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

export async function trackScan(plant_id) {
  try {
    const res = await fetch(`${API_URL}/plants/${plant_id}/scan`, { method: "POST" });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to track scan:", err);
  }
  return null;
}

export async function customizePlant(plant_id, data) {
  try {
    const res = await fetch(`${API_URL}/plants/${plant_id}/customize`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to customize:", err);
    return false;
  }
}

export async function addPlantDiary(plant_id, formData) {
  try {
    // formData is FormData object containing 'file' and 'note'
    const res = await fetch(`${API_URL}/plants/${plant_id}/diary`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.error("Failed to add diary:", err);
    return null;
  }
}
