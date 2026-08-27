import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useHa } from "./ha/HaProvider";
import { primeAudio } from "./lib/alarmSound";
import { AreaPage } from "./components/AreaPage";
import { DoorAlertMonitor } from "./components/DoorAlertMonitor";
import { HomeScreen } from "./components/HomeScreen";
import { Login } from "./components/Login";
import { OverviewPage } from "./components/OverviewPage";
import { Sidebar } from "./components/Sidebar";
import { SettingsPage } from "./components/SettingsPage";

function App() {
  const { status } = useHa();
  const [menuOpen, setMenuOpen] = useState(false);

  // Primes the door-alert AudioContext on the first real tap anywhere in the
  // app, so a later programmatic (non-gesture) alarm play() isn't blocked by
  // the browser's autoplay policy.
  useEffect(() => {
    function onFirstInteraction() {
      primeAudio();
      window.removeEventListener("pointerdown", onFirstInteraction);
    }
    window.addEventListener("pointerdown", onFirstInteraction);
    return () => window.removeEventListener("pointerdown", onFirstInteraction);
  }, []);

  if (status !== "connected") {
    return <Login />;
  }

  return (
    <div className="relative h-full">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        className="fixed top-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-md transition-transform active:scale-95"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="h-full min-w-0">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/area/:areaSlug" element={<AreaPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <DoorAlertMonitor />
    </div>
  );
}

export default App;
