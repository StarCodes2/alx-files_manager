import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    try {
      const result = {
        redis: redisClient.isAlive(),
        db: dbClient.isAlive(),
      };
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getStats(req, res) {
    try {
      const result = {
        users: await dbClient.nbUsers(),
        files: await dbClient.nbFiles(),
      };
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;
