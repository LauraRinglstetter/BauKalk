import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectInfoPage from "./pages/ProjectInfoPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import FurniturePage from "./pages/FurniturePage";
import KitchenPage from "./pages/KitchenPage";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project-info" element={<ProjectInfoPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/furniture" element={<FurniturePage />} />
        <Route path="/kitchen" element={<KitchenPage />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
