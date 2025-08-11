import { hostOf, truncate } from "../utils/text";
import Loader from "./Loader";

const SavedSelect = ({ saved, loading, error, onRefresh, onPick }) => {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 6 }}>
        Pick from saved ({saved ? saved.length : 0})
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          defaultValue=""
          onChange={(e) => onPick(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: 8 }}
        >
          <option value="">— select a saved URL —</option>
          {saved?.map((row) => (
            <option key={row.vid_id} value={row.source_url}>
              {truncate(row.title, 70)} ({hostOf(row.source_url)})
            </option>
          ))}
        </select>

        <button type="button" disabled={loading} onClick={onRefresh}>
          {loading ? (
            <>
              <Loader size={12} thickness={2} />{" "}
              <span style={{ marginLeft: 6 }}>Refreshing…</span>
            </>
          ) : (
            "Refresh"
          )}
        </button>
      </div>

      {error && <div style={{ color: "tomato", marginTop: 6 }}>{error}</div>}
    </div>
  );
};
export default SavedSelect;
