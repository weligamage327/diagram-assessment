import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Login />
    </ThemeProvider>
  );
}

export default App;
