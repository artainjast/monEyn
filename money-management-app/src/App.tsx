import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Cards } from './pages/Cards';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import { Loans } from './pages/Loans';
import { FriendLoans } from './pages/FriendLoans';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

function App() {
    return (
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
    );
}

export default App;
