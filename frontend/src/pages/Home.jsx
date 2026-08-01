import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const res = await api.get('/upload', authHeader);
    setFiles(res.data);
  };

  const handleUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  for (const file of files) {
    const relativePath = file.webkitRelativePath || '';
    const project = relativePath.includes('/') ? relativePath.split('/')[0] : 'Uploads';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project', project);
    try {
      await api.post('/upload', formData, {
        headers: { ...authHeader.headers, 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error(`Failed to upload ${file.name}:`, err);
    }
  }
  loadFiles();
};

  const selectFile = async (file) => {
    setActiveFile(file);
    const res = await api.get(`/chat/${file._id}`, authHeader);
    setMessages(res.data);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || !activeFile) return;
    setLoading(true);
    const q = question;
    setQuestion('');
    try {
      const res = await api.post('/chat', { codeFileId: activeFile._id, question: q }, authHeader);
      setMessages(prev => [...prev, { question: q, answer: res.data.answer, sources: res.data.sources }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar-logo">
            <img src="/favicon3.svg" alt="" className="logo-icon" />
            codechat</span>
        <div className="topbar-right">
          <span className="topbar-user">{userEmail}</span>
          <button className="logout-btn" onClick={handleLogout}>log out</button>
        </div>
      </header>
      <div className="home">
        <aside className="sidebar">
          <div className="sidebar-title">FILES</div>
          <div className="file-list">
            {files.map(f => (
              <div
                key={f._id}
                className={`file-item ${activeFile?._id === f._id ? 'active' : ''}`}
                onClick={() => selectFile(f)}
              >
                <span className="file-dot" />
                {f.filename}
              </div>
            ))}
          </div>
          <div className="upload-row">
            <label className="upload-btn">
                + files
                <input type="file" onChange={handleUpload} multiple hidden />
            </label>
            <label className="upload-btn">
            + folder
            <input type="file" onChange={handleUpload} multiple webkitdirectory="" hidden />
            </label>
        </div>
        </aside>

        <main className="chat-panel">
          {!activeFile ? (
            <div className="empty-state">
              <div className="empty-state-icon">&gt;_</div>
              select or upload a file to start
            </div>
          ) : (
            <>
              <div className="chat-header">codechat &mdash; {activeFile.filename}</div>
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className="message-pair">
                    <div className="chat-question">&gt; {m.question}</div>
                    <div className="chat-answer">
                      <div className="markdown-answer"><ReactMarkdown>{m.answer}</ReactMarkdown></div>
                      {m.sources && <div className="chat-source">from {activeFile.filename} : {m.sources.join(', ')}</div>}
                    </div>
                  </div>
                ))}
                {loading && <div className="chat-question typing">thinking&hellip;</div>}
              </div>
              <form onSubmit={handleAsk} className="chat-input-row">
                <span>&gt;</span>
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="ask about this code…"
                />
                <button type="submit" disabled={!question.trim()}>send</button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}