import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const collection = dbClient.db.collection('users');
      const user = await collection.findOne({ email });
      if (user) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPwd = sha1(password);
      const result = await collection.insertOne({ email, password: hashedPwd });
      return res.status(201).json({ id: result.insertedId, email });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
