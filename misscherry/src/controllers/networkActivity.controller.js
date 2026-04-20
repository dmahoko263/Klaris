import { getNetworkActivities } from "../services/networkActivity.service.js";

export async function fetchNetworkActivities(req, res) {
  try {
    const rows = await getNetworkActivities();
    res.json({ ok: true, entries: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}