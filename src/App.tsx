import { Route, Routes } from "react-router-dom";
import "./App.css";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
