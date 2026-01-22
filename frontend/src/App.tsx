import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PlayerPage } from './pages/Player/PlayerPage';
import { HomePage } from './pages/Home/Homepage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
