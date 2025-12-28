import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Feed from "./pages/Feed";
import Agenda from "./pages/Agenda";
import Mates from "./pages/Mates";
import Notifications from "./pages/Notifications";
import CreateActivity from "./pages/CreateActivity";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Feed />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="mates" element={<Mates />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="create-activity" element={<CreateActivity />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
