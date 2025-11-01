import { MongoClient } from "mongodb";

// In-memory storage for localhost development (when MongoDB is not available)
class InMemoryDB {
  private scores: Map<string, any> = new Map();

  async collection(name: string) {
    return {
      find: () => ({
        sort: () => ({
          limit: () => ({
            toArray: async () => {
              return Array.from(this.scores.values()).sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return b.timestamp - a.timestamp;
              });
            },
          }),
        }),
      }),
      findOne: async (query: any) => {
        return this.scores.get(query.walletAddress) || null;
      },
      insertOne: async (doc: any) => {
        this.scores.set(doc.walletAddress, doc);
        return { insertedId: doc.walletAddress };
      },
      updateOne: async (query: any, update: any) => {
        const existing = this.scores.get(query.walletAddress);
        if (existing) {
          this.scores.set(query.walletAddress, { ...existing, ...update.$set });
        }
        return { modifiedCount: 1 };
      },
    };
  }
}

const useInMemory =
  !process.env.MONGODB_URI ||
  process.env.MONGODB_URI === "mongodb://localhost:27017";

let clientPromise: Promise<any>;

if (useInMemory) {
  console.log("📦 Using in-memory storage for localhost development");

  const inMemoryDB = new InMemoryDB();
  const mockClient = {
    db: () => inMemoryDB,
  };

  clientPromise = Promise.resolve(mockClient);
} else {
  // Use real MongoDB
  const uri = process.env.MONGODB_URI!;
  const options = {};

  let client: MongoClient;

  if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;
