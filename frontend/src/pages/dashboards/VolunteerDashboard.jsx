import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function VolunteerDashboard() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Fetch nearby SOS
  const fetchNearbySOS = async () => {
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        setMessage("⚠️ Location not available");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { data } = await api.get(
            `/sos/nearby?lng=${pos.coords.longitude}&lat=${pos.coords.latitude}&within=10000`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setSosList(data);
        } catch (err) {
          console.error("Failed to fetch SOS:", err);
          setMessage("❌ Failed to load SOS");
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbySOS();
    // Auto-refresh every 30 sec
    const interval = setInterval(fetchNearbySOS, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Update SOS status
  const updateStatus = async (id, status) => {
    try {
      await api.patch(
        `/sos/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(`✅ SOS marked as ${status}`);
      fetchNearbySOS(); // refresh list
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🚑 Volunteer Dashboard</h1>
        <button
          onClick={fetchNearbySOS}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
        >
          🔄 Refresh
        </button>
      </header>

      {message && <p className="mb-4 text-center">{message}</p>}

      {loading ? (
        <p>Loading SOS requests...</p>
      ) : sosList.length === 0 ? (
        <p className="text-center text-gray-600">
          🎉 No SOS requests nearby (within 10 km)
        </p>
      ) : (
        <div className="grid gap-4">
          {sosList.map((sos) => (
            <div
              key={sos._id}
              className="bg-white p-4 rounded-lg shadow-md border"
            >
              <h2 className="font-bold text-lg">🚨 SOS Request</h2>
              <p>
                <strong>Name:</strong> {sos.details.name || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {sos.details.phone}
              </p>
              <p>
                <strong>People:</strong> {sos.details.peopleCount}
              </p>
              <p>
                <strong>Help Needed:</strong> {sos.details.helpType}
              </p>
              <p>
                <strong>Issue:</strong> {sos.details.issue}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-blue-600">{sos.status}</span>
              </p>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateStatus(sos._id, "accepted")}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(sos._id, "in_progress")}
                  className="px-3 py-1 bg-orange-600 text-white rounded"
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(sos._id, "rescued")}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Rescued
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
