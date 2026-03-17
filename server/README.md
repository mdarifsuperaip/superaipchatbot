# Super AI Chatbot - Server

This is the backend server for the Super AI Chatbot, a Retrieval-Augmented Generation (RAG) system built with Node.js, Express, LangChain, Google Gemini, and Pinecone.

## Features

- **PDF Ingestion**: Automatically splits and embeds PDF documents for vector search.
- **Vector Database**: Uses Pinecone to store and retrieve relevant document chunks.
- **RAG Implementation**: Combines retrieved context with Google's Gemini models for accurate, grounded responses.
- **REST API**: Simple Express-based endpoint for chat interactions.

## Tech Stack

- **Backend**: Node.js, Express
- **LLM**: Google Gemini (`gemini-1.5-flash`, `gemini-2.5-flash`)
- **Embeddings**: Google Gemini (`gemini-embedding-001`)
- **Vector Store**: Pinecone
- **Framework**: LangChain

## Prerequisites

- Node.js installed.
- A [Google AI Studio](https://aistudio.google.com/) API Key.
- A [Pinecone](https://www.pinecone.io/) Account and Index.

## Getting Started

1.  **Navigate to the server directory**:
    ```bash
    cd server
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env` file in the `server` directory and add your keys:
    ```env
    PORT=5000
    GEMINI_API_KEY=your_gemini_api_key
    PINECONE_API_KEY=your_pinecone_api_key
    PINECONE_INDEX_NAME=your_index_name
    ```

## Usage

### 1. Ingest Documents
Place your PDF file (default: `superaip.pdf`) in the `server` directory and run the ingestion script to populate Pinecone:
```bash
node ingest.js
```

### 2. Start the Server
Start the Express server to handle chat requests:
```bash
node index.js
```
The server will run on `http://localhost:5000` (or your configured `PORT`).

### 3. API Endpoints
- **POST `/chat`**: Send a JSON body with a `question` to get a response.
  ```json
  {
    "question": "What is the main topic of the document?"
  }
  ```

## Utility Scripts

- `query.js`: A CLI tool to test RAG queries directly.
  ```bash
  node query.js "Explain the core concepts"
  ```
- `list_models.js`: Lists available Google Gemini models.
- `test_emb.js`: Tests the embedding generation process.
- `output.log`: Logs from previous runs.
