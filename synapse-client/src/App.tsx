// import reactLogo from './assets/react.svg'
import SearchModal from '@/components/SearchModal';
import { SynapseProvider } from '@/synapseContext';
import HotKeyProvider from './providers/HotKeyProvider';
import Layout from './layouts/Layout';
import { BrowserRouter, Routes, Route, useParams, useLocation, Navigate, } from 'react-router-dom';

import './App.css'
import NewTab from './containers/NewTab';
import Settings from './containers/Settings';
import { EditorWrapper } from './features/editor';

// Wrapper component for handling unified document paths
const DocumentWrapper = () => {
  // Get the complete path including any slashes
  const {'*': docPath} = useParams();

  if (!docPath) {
    throw new Error(`docPath is falsy; docPath=${docPath}. Ensure empty vault paths are redirected appropriately`);
  }

  // Determine if this is a chat based on file extension or metadata
  // const isChat = docPath.endsWith('.chat'); // or however you want to distinguish

  if (docPath.endsWith('.chat')) return <ChatRenderer docPath={docPath} />
  else if (docPath.endsWith('.md')) return <EditorWrapper filePath={docPath} />
  else return <div>Unsupported document: {docPath}</div>


  // return isChat ? (
  //   <ChatRenderer docPath={docPath} />
  // ) : (
  //   // <PageRenderer docPath={docPath} />
  // );
};

function App() {
  return (
    <div>
      <SynapseProvider>
        <HotKeyProvider>
          <BrowserRouter>
            <Layout>
              <SearchModal />
              <Routes>
                {/* Welcome page */}
                <Route path="/" element={<NewTab />} />

                <Route path="/d" element={<Navigate to="/" replace />} />
                {/* Unified document handler - works for both pages and chats */}
                <Route path="/d/*" element={<DocumentWrapper />} />

                {/* Settings page */}
                <Route path="/settings" element={<Settings />} />

                {/* Graph view */}
                {/* <Route path="/graph" element={<GraphView />} /> */}

                {/* Optional: Catch all route for 404s */}
                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </Layout>
          </BrowserRouter>
        </HotKeyProvider>
      </SynapseProvider>
    </div>
  )
}

export default App

// Example implementations
const ChatRenderer = ({ docPath }) => {
  // Extract any necessary info from the path
  // e.g., meetings/weekly/2024-02-06.chat
  return <div>Chat Document: {docPath}</div>;
};

const PageRenderer = ({ docPath }) => {
  // Handle markdown or other document types
  // e.g., projects/roadmap.md
  return <div>Page Document: {docPath}</div>;
};
