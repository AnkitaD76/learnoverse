import { SessionProvider } from './contexts/SessionContext';
import { WalletProvider } from './contexts/WalletContext';
import { AppRouter } from './router/index.jsx';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export default function App() {
    return (
        <SessionProvider>
            <WalletProvider>
                <div className="flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">
                        <AppRouter />
                    </main>
                    <Footer />
                </div>
            </WalletProvider>
        </SessionProvider>
    );
}
