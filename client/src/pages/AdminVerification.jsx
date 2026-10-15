import { useEffect, useState } from "react";
import axiosClient, { getErrorMessage } from "../api/axiosClient";

const AdminVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  // GET /api/admin/verifications
  useEffect(() => {
    axiosClient
      .get("/admin/verifications")
      .then(({ data }) => setVerifications(data.verifications))
      .catch((err) =>
        setStatus({
          type: "error",
          message: getErrorMessage(err, "Failed to load requests")
        })
      )
      .finally(() => setLoading(false));
  }, []);

  // GET /api/admin/verifications/:id/document (needs auth header, so fetch as blob)
  const viewDocument = async (id) => {
    try {
      const { data } = await axiosClient.get(
        `/admin/verifications/${id}/document`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(data);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setStatus({ type: "error", message: "Unable to open document" });
    }
  };

  // PATCH /api/admin/verifications/:id/approve | reject
  const review = async (id, action) => {
    const adminNote = (notes[id] || "").trim();

    if (action === "reject" && !adminNote) {
      setStatus({ type: "error", message: "A rejection reason is required" });
      return;
    }

    setBusyId(id);
    setStatus({ type: "", message: "" });

    try {
      const { data } = await axiosClient.patch(
        `/admin/verifications/${id}/${action}`,
        { adminNote }
      );

      setVerifications((list) => list.filter((v) => v._id !== id));
      setStatus({ type: "success", message: data.message });
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(err, `Failed to ${action} request`)
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Pending Verifications</h1>

      {status.message && (
        <div className={`alert alert-${status.type}`}>{status.message}</div>
      )}

      {verifications.length === 0 ? (
        <div className="card muted">No pending verification requests.</div>
      ) : (
        verifications.map((v) => (
          <div className="card" key={v._id}>
            <dl className="details">
              <dt>Name</dt>
              <dd>{v.userId?.name || "Deleted user"}</dd>

              <dt>Email</dt>
              <dd>{v.userId?.email || "—"}</dd>

              <dt>Role</dt>
              <dd>{v.userId?.role || "—"}</dd>

              <dt>Document</dt>
              <dd>{v.documentType}</dd>

              <dt>Submitted</dt>
              <dd>{new Date(v.createdAt).toLocaleString()}</dd>
            </dl>

            <textarea
              rows={2}
              maxLength={500}
              placeholder="Admin note (required for rejection)"
              value={notes[v._id] || ""}
              onChange={(e) => setNotes({ ...notes, [v._id]: e.target.value })}
            />

            <div className="actions">
              <button className="btn btn-outline" onClick={() => viewDocument(v._id)}>
                View Document
              </button>
              <button
                className="btn btn-success"
                disabled={busyId === v._id}
                onClick={() => review(v._id, "approve")}
              >
                Approve
              </button>
              <button
                className="btn btn-danger"
                disabled={busyId === v._id}
                onClick={() => review(v._id, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminVerification;
