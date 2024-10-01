import { MongoClient } from 'mongodb';
import assert from 'assert';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(database);
    })
    .catch((err) => {
      console.error(`Error connecting to MongoDB: ${err.message}`);
    });
  }

  isAlive() {
    return !!this.client && this.client.isConnected();
  }

  async nbUsers() {
    try {
      return await this.db.collection('users').countDocuments();
    } catch(err) {
      console.error(`Error counting users: ${err.message}`);
    }
  }

  async nbFiles() {
    try {
      return await this.db.collection('files').countDocuments();
    } catch(err) {
      console.error(`Error counting files: ${err.message}`);
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
