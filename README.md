CodeChat

A RAG-based code Q&A assistant. Upload a source code file and chat with it — ask questions like "where is authentication handled?" or "what does this function do?" and get answers grounded in the actual uploaded code, with the exact source lines cited.

Built as a full-stack course project using the MERN stack, applying the Retrieval-Augmented Generation (RAG) pattern to code instead of documents.

Live demo: https://codechat-three.vercel.app Backend API: https://codechat-lcl0.onrender.com

Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after a period of idleness may take up to ~50 seconds to respond while the server wakes up.

Features
Auth — signup/login with JWT-based sessions, passwords hashed with bcrypt
File upload — upload a source code file, tied to your account
Chunking — uploaded code is automatically split into indexed, retrievable chunks
Chat — ask natural-language questions about an uploaded file; relevant chunks are retrieved via keyword search and passed to Gemini for a grounded answer
Source tracing — every answer shows which lines of the file it was generated from
Chat history — past questions and answers are saved per file and reloaded on selection
Tech stack
Layer	Technology
Frontend	React (Vite), React Router, Axios
Backend	Node.js, Express
Database	MongoDB (Mongoose), hosted on Atlas
Auth	JWT, bcrypt
AI / LLM	Google Gemini API (Flash-Lite)
Deployment	Vercel (frontend), Render (backend)
Project structure
codechat/
├── backend/
│   ├── models/        # User, CodeFile, CodeChunk, ChatMessage
│   ├── routes/         # auth, upload, chat
│   ├── utils/           # chunker, retriever
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/       # Login, Signup, Home
    │   └── api.js
    └── public/
    
How it works
A user uploads a code file. The backend stores it and splits it into fixed-size line chunks (v1 uses simple line-based chunking rather than syntax-aware parsing).
When a question is asked, the backend scores each chunk by keyword overlap with the question and retrieves the top 3 most relevant chunks.
Those chunks are passed to the Gemini API as context, along with the question, with an instruction to answer only from the given context.
The answer, along with which chunks it came from, is returned and saved to that file's chat history.
Running locally

Backend

bash
cd backend
npm install
# create a .env file with MONGO_URI, JWT_SECRET, GEMINI_API_KEY, PORT
npx nodemon server.js

Frontend

bash
cd frontend
npm install
npm run dev

By default the frontend points at the deployed backend URL (see src/api.js) — change it to http://localhost:5000/api for local-only testing.

Scope and future work

v1 (current) deliberately excludes:

Cloning a GitHub repository directly by URL (manual file upload only)
Embeddings-based semantic search (keyword-based retrieval instead)
Multi-language, syntax-aware chunking (line-based chunking works across any language)
Shared/collaborative chat sessions

These are natural next steps if the project were extended beyond the current scope.

Why this project

This isn't intended to compete with general-purpose AI assistants like ChatGPT. Its purpose is to demonstrate a working, end-to-end implementation of the RAG pattern — chunking, retrieval, and grounded generation — built and understood from the ground up, rather than a single prompt-and-response wrapper around an API. It also builds on an earlier personal RAG project (a PDF Q&A chatbot), reapplying the same retrieval pattern to a new domain and a new stack.