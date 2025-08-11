// front/src/pages/ScraperPage.jsx
import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  fetchVideoMeta,
  saveVideoMeta,
  fetchSavedVideos,
} from "../functions/appFunctions";
import {
  buildExportRow,
  buildSummaryJSX,
  downloadBlob,
  downloadVideoBlob,
  makeScraperSummary,
  rowsToCSV,
  safeName,
  summaryToJSX,
} from "../functions/scraperInnerFunctions";
import {
  LoadingOverlay,
  SavedSelect,
  ActionBar,
  SummaryPanel,
} from "../components";
import { useElapsed } from "../hooks";
import { hostOf, truncate } from "../utils/text";

/* ---------- Component ---------- */
const ScraperPage = () => {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [result, setResult] = useState(null); // { ok, meta, insertedId?, partial?, reason? }
  const [summaryJSX, setSummaryJSX] = useState(null);

  // saved items (we'll load locally to guarantee shape)
  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedErr, setSavedErr] = useState("");

  // rolling averages for ETA
  const [avgFetchMs, setAvgFetchMs] = useState(null);
  const [avgSaveMs, setAvgSaveMs] = useState(null);

  // elapsed timers for overlay
  const { elapsedMs: fetchElapsed, etaMs: fetchEta } = useElapsed(
    busy,
    avgFetchMs
  );
  const { elapsedMs: saveElapsed, etaMs: saveEta } = useElapsed(
    saving,
    avgSaveMs
  );
  const { elapsedMs: dlElapsed } = useElapsed(downloading, null);

  // Load saved list (DB) → rows
  const loadSaved = async () => {
    setLoadingSaved(true);
    setSavedErr("");
    try {
      const rows = await fetchSavedVideos(50);
      setSaved(rows || []);
    } catch (e) {
      setSavedErr(String(e?.message || e));
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  // Map rows to { value, label, key } for SavedSelect
  const savedOptions = useMemo(
    () =>
      (saved || []).map((row) => ({
        key: row.vid_id ?? row.id ?? row.source_url,
        value: row.source_url,
        label: `${truncate(row.title, 70)} (${hostOf(row.source_url)})`,
      })),
    [saved]
  );

  const onPickSaved = (val) => {
    if (!val) return;
    setUrl(val);
    setResult(null);
    setSummaryJSX(null);
  };

  const onGetMeta = async (e) => {
    e?.preventDefault?.();
    if (!url) return;
    setBusy(true);
    setResult(null);
    setSummaryJSX(null);
    const t0 = performance.now();
    try {
      const meta = await fetchVideoMeta(url);
      const maybe = makeScraperSummary ? makeScraperSummary(meta) : null;
      const jsx =
        typeof maybe === "string" || !!maybe?.props
          ? maybe
          : buildSummaryJSX(meta);
      setResult({ ok: true, meta });
      setSummaryJSX(jsx);
      const dt = performance.now() - t0;
      setAvgFetchMs((prev) =>
        prev == null ? dt : Math.round(prev * 0.6 + dt * 0.4)
      );
    } catch (err) {
      setResult({ ok: false, error: String(err?.message || err) });
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (!url) return;
    setSaving(true);
    const t0 = performance.now();
    try {
      const resp = await saveVideoMeta(url);
      const jsx = summaryToJSX(resp?.summary, resp?.meta);
      setResult({
        ok: true,
        meta: resp.meta,
        insertedId: resp.insertedId,
        partial: resp.partial,
        reason: resp.reason,
      });
      setSummaryJSX(jsx);
      await loadSaved();
      const dt = performance.now() - t0;
      setAvgSaveMs((prev) =>
        prev == null ? dt : Math.round(prev * 0.6 + dt * 0.4)
      );
    } catch (e) {
      alert(`Save failed: ${e.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  const onDownload = async () => {
    if (!result?.ok || !result?.meta?.webpage_url) return;
    setDownloading(true);
    try {
      const blob = await downloadVideoBlob({
        url,
        title: result.meta.title || "video",
      });
      const base = safeName(result.meta.title || "video");
      downloadBlob(blob, `${base}.mp4`);
    } catch (e) {
      alert(`Download failed: ${e.message || e}`);
    } finally {
      setDownloading(false);
    }
  };

  // Export handlers
  const onExportCSV = () => {
    if (!result?.ok || !result?.meta) return;
    const row = buildExportRow(result.meta);
    const headers = [
      "source_url",
      "title",
      "uploader",
      "upload_date",
      "duration_seconds",
      "categories",
      "tags",
      "view_count",
      "like_count",
      "width",
      "height",
      "fps",
      "format",
      "webpage_url",
    ];
    const csv = rowsToCSV([row], headers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const base = safeName(result.meta.title || "video");
    downloadBlob(blob, `${base}.csv`);
  };

  const onExportXLSX = () => {
    if (!result?.ok || !result?.meta) return;
    const row = buildExportRow(result.meta);
    const headers = [
      "source_url",
      "title",
      "uploader",
      "upload_date",
      "duration_seconds",
      "categories",
      "tags",
      "view_count",
      "like_count",
      "width",
      "height",
      "fps",
      "format",
      "webpage_url",
    ];
    const data = [headers, headers.map((h) => row[h] ?? "")];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Video");
    const ab = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([ab], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const base = safeName(result.meta.title || "video");
    downloadBlob(blob, `${base}.xlsx`);
  };

  const canSave = result?.ok === true && url && !saving;
  const canDownload =
    result?.ok === true && !!result?.meta?.webpage_url && !downloading;

  // overlay
  const overlayMessage = busy
    ? "Fetching metadata…"
    : saving
    ? "Saving to database…"
    : downloading
    ? "Downloading video…"
    : "Working…";
  const overlayElapsed = busy ? fetchElapsed : saving ? saveElapsed : dlElapsed;
  const overlayEta = busy ? fetchEta : saving ? saveEta : null;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <LoadingOverlay
        show={busy || saving || downloading}
        message={overlayMessage}
        elapsedMs={overlayElapsed}
        etaMs={overlayEta}
      />

      <h2>Video Scraper</h2>

      <SavedSelect
        // Pass both shapes for compatibility:
        saved={saved}
        items={savedOptions}
        loading={loadingSaved}
        error={savedErr}
        onRefresh={loadSaved}
        onPick={onPickSaved}
      />

      <form onSubmit={onGetMeta}>
        <input
          style={{ width: "100%", padding: 8 }}
          placeholder="Paste a video page URL…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <ActionBar
          url={url}
          busy={busy}
          saving={saving}
          downloading={downloading}
          canSave={canSave}
          canDownload={canDownload}
          onGetMeta={onGetMeta}
          onSave={onSave}
          onDownload={onDownload}
        />
      </form>

      <SummaryPanel>{result?.ok && summaryJSX}</SummaryPanel>

      {result?.ok && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button type="button" onClick={onExportCSV}>
            Export CSV
          </button>
          <button type="button" onClick={onExportXLSX}>
            Export XLSX
          </button>
        </div>
      )}

      {result && (
        <pre
          style={{
            marginTop: 12,
            background: "#111",
            color: "#ddd",
            padding: 12,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ScraperPage;
