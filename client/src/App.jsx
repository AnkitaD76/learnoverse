import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { AppRouter } from './router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
