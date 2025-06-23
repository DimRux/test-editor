import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NewsList from "./components/NewsList";
import { Editor } from "./components/Editor";

function App() {
  return (
    <Router>
      <div className="h-screen bg-gray-50 overflow-auto">
        <Routes>
          <Route path="/" element={<NewsList />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:id" element={<Editor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
