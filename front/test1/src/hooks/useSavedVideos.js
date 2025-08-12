import { useCallback, useEffect, useState } from "react";
import { fetchSavedVideos } from "../functions/appFunctions";

const useSavedVideos = (initialLimit = 50) => {
  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedErr, setSavedErr] = useState("");

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    setSavedErr("");
    try {
      setSaved(await fetchSavedVideos(initialLimit));
    } catch (e) {
      setSavedErr(String(e.message || e));
    } finally {
      setLoadingSaved(false);
    }
  }, [initialLimit]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  return { saved, loadingSaved, savedErr, loadSaved };
};
export default useSavedVideos;
