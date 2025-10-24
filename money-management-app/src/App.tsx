import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Cards } from './pages/Cards';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import { Loans } from './pages/Loans';
import { FriendLoans } from './pages/FriendLoans';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { MigrationService } from './services/migrationService';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    useEffect(() => {
        // Check for database migrations on app startup
        MigrationService.checkForMigrations();

        // Show migration notification if needed
        MigrationService.showMigrationNotification();
    }, []);

    return (
        <ThemeProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/cards" element={<Cards />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/loans" element={<Loans />} />
                        <Route path="/friend-loans" element={<FriendLoans />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
