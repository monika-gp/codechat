# CodeChat

A RAG-based code Q&A assistant. Upload a source code file, several files, or a whole project folder, and chat with it — ask questions like "where is authentication handled?" or "what does this function do?" and get answers grounded in the actual uploaded code, with the exact source lines cited.

Built as a full-stack course project using the MERN stack, applying the Retrieval-Augmented Generation (RAG) pattern to code instead of documents — using a hybrid of keyword search and Gemini embeddings for retrieval.

**Live demo:** https://codechat-three.vercel.app
**Backend API:** https://codechat-lcl0.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after a period of idleness may take up to ~50 seconds to respond while the server wakes up.

Features
Auth — signup/login with JWT-based sessions, passwords hashed with bcrypt
Multi-file & folder upload — upload a single file, several files, or an entire project folder at once, with size and file-type validation
Project grouping — files are grouped by their folder/project name in the sidebar, so identically-named files from different projects (e.g. two different server.js) don't get confused with each other
Chunking with overlap — uploaded code is split into indexed, overlapping chunks, reducing the chance that a function gets cut across a chunk boundary
Hybrid retrieval — chunks are scored using a blend of keyword matching and Gemini-embeddings-based semantic similarity, so a question can find relevant code even when it doesn't share exact wording with it
Conversation-aware chat — recent Q&A history is included in the prompt, so natural follow-ups like "why?" are understood
Source tracing — every answer shows which lines of which file it was generated from
Chat history — persisted per file, reloaded on selection
Delete — remove a single file or an entire project group, cascading to their chunks and chat history
Ownership enforcement — every protected route verifies the requested resource actually belongs to the authenticated user (fixes an IDOR vulnerability found during a security review — see Testing & Findings below)
Loading states — visible feedback while the file list loads and while an upload is in progress
Tech stack
Layer	Technology
Frontend	React (Vite), React Router, Axios, react-markdown
Backend	Node.js, Express
Database	MongoDB (Mongoose), hosted on Atlas
Auth	JWT, bcrypt
AI / LLM	Google Gemini API (Flash-Lite for generation, text-embedding-004 for retrieval)
Deployment	Vercel (frontend), Render (backend)
Project structure
codechat/
├── backend/
│   ├── models/        # User, CodeFile, CodeChunk, ChatMessage
│   ├── routes/         # auth, upload, chat
│   ├── utils/           # chunker, retriever, embedder
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/       # Login, Signup, Home
    │   └── api.js
    └── public/
How it works
A user uploads one or more files, or a whole folder. The backend validates size/type, stores each file, and splits it into overlapping 40-line chunks (10-line overlap).
On upload, each chunk is sent to Gemini's embedding model, and the resulting vector is stored alongside it.
When a question is asked, the backend embeds the question the same way, then scores every chunk of the selected file by a blend of keyword overlap and cosine similarity to the question's embedding, returning the top-scoring chunks (scaled by file size).
Those chunks, plus the last few Q&A exchanges for context, are passed to the Gemini API with an instruction to answer only from the given context.
The answer, and which chunks it came from, is returned, shown in the UI with its source lines, and saved to that file's chat history.
Architecture
React frontend (Vercel)
        │
        ▼
Express API (Render) ──► Gemini API (generation + embeddings)
        │
        ▼
MongoDB Atlas (users, files, chunks, chat history)
Running locally

**Backend**
```bash
cd backend
npm install
# create a .env file with MONGO_URI, JWT_SECRET, GEMINI_API_KEY, PORT
npx nodemon server.js
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

By default the frontend points at the deployed backend URL (see `src/api.js`) — change it to `http://localhost:5000/api` for local-only testing.

Testing & findings

Every endpoint was manually tested via Postman (valid/invalid input, auth boundaries, ownership checks) and end-to-end through the live UI. Beyond functional testing, retrieval quality itself was specifically tested:

Security: confirmed a request for another user's file ID correctly returns 404, while a request for the requester's own file still succeeds.
Embeddings vs. keyword-only: a question phrased with different words than the code itself (e.g. "reputation" when the code only uses "trust score") was only retrieved correctly after adding embeddings.
Chunk boundaries: a function split across a hard 40-line chunk boundary failed to retrieve correctly; after introducing chunk overlap, the same function was retrieved intact.
Residual limitation: a casually-phrased question can still miss code described in highly technical terms, even with embeddings — isolating a retrieval-ranking gap under significant vocabulary mismatch as documented future work, not a chunking issue.
Scope and future work

Deliberately out of v1:

Cloning a GitHub repository directly by URL (manual file/folder upload only)
Syntax-aware chunking (splitting by function/class boundaries rather than fixed, overlapping line counts)
A dedicated vector index (e.g. MongoDB Atlas Vector Search) in place of in-memory cosine similarity
Storing very large files via GridFS rather than a single document field
Shared/collaborative chat sessions
Why this project

This isn't intended to compete with general-purpose AI assistants like ChatGPT. Its purpose is to demonstrate a working, end-to-end implementation of the RAG pattern — chunking, hybrid retrieval, and grounded generation — built, tested, and iterated on from the ground up, rather than a single prompt-and-response wrapper around an API. It also builds on an earlier personal RAG project (a PDF Q&A chatbot), reapplying the same retrieval pattern to a new domain and a new stack.
