import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
