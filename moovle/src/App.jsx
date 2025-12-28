import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Agenda from "./pages/Agenda";
import Mates from "./pages/Mates";
import Notifications from "./pages/Notifications";
import CreateActivity from "./pages/CreateActivity";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Feed />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="mates" element={<Mates />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="create-activity" element={<CreateActivity />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
