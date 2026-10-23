import { useState } from 'react';
import { useApp } from './context/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReportIssue from './components/ReportIssue';
import Inspections from './components/Inspections';
import ComplianceChecklist from './components/ComplianceChecklist';
import ScanForm from './components/ScanForm';
import Contractors from './components/Contractors';
import AllMines from './components/AllMines';
import ReportHistory from './components/ReportHistory';
import './App.css';

export default function App() {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'report': return <ReportIssue setCurrentPage={setCurrentPage} />;
      case 'inspections': return <Inspections />;
      case 'compliance': return <ComplianceChecklist />;
      case 'scan': return <ScanForm />;
      case 'contractors': return <Contractors />;
      case 'history': return <ReportHistory />;
      case 'allmines': return <AllMines setCurrentPage={setCurrentPage} />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
