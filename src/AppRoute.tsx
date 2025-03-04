import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { PainelView } from "@/pages/painel";
import { PlaylistView } from "@/pages/playlist";
import LiveStreamsView from "@/pages/playlist/live-streams";
import LiveView from "@/pages/playlist/live-streams/live";

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* <Route
          index
          path="/"
          // element={<>{window.location.href = "#/painel"}</>}
        /> */}
        <Route index path="/" element={<PainelView />} />
        <Route path="/playlist/:id" element={<PlaylistView />} />
        <Route
          path="/playlist/:id/live-streams"
          element={<LiveStreamsView />}
        />
        <Route
          path="/playlist/:id/live-streams/:stream_id"
          element={<LiveView />}
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
