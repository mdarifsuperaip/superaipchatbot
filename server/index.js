const express = require('express');
const cors = require('cors');
const { Pinecone } = require('@pinecone-database/pinecone');
const { ChatGroq } = require('@langchain/groq');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskType } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send("server is running perfectly fine ");
});

async function setup() {
  console.log("Initializing Pinecone...");
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY.trim(),
  });
  const indexName = process.env.PINECONE_INDEX_NAME.trim();
  const index = pc.Index(indexName);

  console.log("Initializing Embeddings...");
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY.trim(),
    modelName: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_QUERY,
  });

  console.log("Initializing Groq Chat Model...");
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY.trim(),
    model: "llama-3.3-70b-versatile",
  });

  app.post('/chat', async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      console.log(`Querying: "${question}"...`);

      // 1. Embed the query
      const queryEmbedding = await embeddings.embedQuery(question);

      // 2. Search Pinecone
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
      });

      // 3. Extract context
      const context = queryResponse.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");

      if (!context) {
        // Fallback to general knowledge if no context found
        const response = await model.invoke(question);
        return res.json({ text: response.content });
      }

      // 4. Generate answer with context
      const prompt = `
        You are a helpful assistant. Use the following context to answer the question.
        If the context doesn't contain the answer, use your general knowledge but mention it's not in the document.

        Context:
        ${context}

        Question: ${question}

        Answer:
      `;

      const response = await model.invoke(prompt);
      res.json({ text: response.content });

    } catch (error) {
      console.error("Error during /chat:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setup().catch(console.error);

module.exports = app;
