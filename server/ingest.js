const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskType } = require('@google/generative-ai');
require('dotenv').config();

async function ingest() {
  let parser;
  try {gemini-2.5-flash
    console.log("Loading PDF...");
    const dataBuffer = fs.readFileSync('superaip.pdf');
    
    parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
    const result = await parser.getText();
    const text = result.text;

    if (!text || text.trim().length === 0) {
      throw new Error("No text extracted from PDF.");
    }

    console.log("Splitting text into chunks...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.createDocuments([text]);

    console.log(`Created ${docs.length} documents.`);

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
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    console.log("Generating embeddings for documents...");
    const contents = docs.map((d) => d.pageContent);
    const embs = await embeddings.embedDocuments(contents);
    console.log(`Generated ${embs.length} embeddings.`);

    if (embs.length === 0) {
      throw new Error("Generated 0 embeddings.");
    }

    console.log("Storing in Pinecone manual way...");
    const vectors = docs.map((doc, i) => {
      // Flatten metadata: Pinecone doesn't support nested objects
      const metadata = { text: doc.pageContent };
      for (const [key, value] of Object.entries(doc.metadata)) {
        if (typeof value === 'object' && value !== null) {
          metadata[key] = JSON.stringify(value);
        } else {
          metadata[key] = value;
        }
      }

      return {
        id: `id_${Date.now()}_${i}`,
        values: embs[i],
        metadata: metadata,
      };
    });

    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      console.log(`Upserting batch ${i / batchSize + 1} with ${batch.length} vectors...`);
      console.log('Sample vector:', JSON.stringify(batch[0], null, 2).slice(0, 500));
      await index.upsert({ records: batch });
    }

    console.log("Ingestion complete!");
  } catch (error) {
    console.error("Error during ingestion:", error);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

ingest();
