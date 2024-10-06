import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const { ObjectId } = require('mongodb');
const fs = require('fs');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, type } = req.body;
      const parentId = req.body.parentId || 0;
      const isPublic = req.body.isPublic || false;
      const { data } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || (type !== 'folder' && type !== 'file' && type !== 'image')) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId !== 0) {
        const folder = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!folder) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (folder.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let parentObjId = '0';
      if (parentId !== 0) {
        parentObjId = ObjectId(parentId);
      }

      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne({
          userId: ObjectId(userId),
          name,
          type,
          parentId: parentObjId,
        });

        return res.status(201).json({
          id: result.insertedId,
          userId,
          name,
          type,
          isPublic,
          parentId,
        });
      }

      const path = process.env.FOLDER_PATH || '/tmp/files_manager';
      let bufData = null;
      if (type === 'image') {
        bufData = Buffer.from(data, 'base64');
      } else {
        bufData = Buffer.from(data, 'base64').toString('utf8');
      }

      if (!fs.existsSync(path)) { fs.mkdirSync(path); }

      const fileName = uuidv4();
      const result = await dbClient.db.collection('files').insertOne({
        userId: user._id,
        name,
        type,
        isPublic,
        parentId: parentObjId,
        localPath: `${path}/${fileName}`,
      });

      const fd = fs.openSync(`${path}/${fileName}`, 'w');
      fs.writeSync(fd, bufData);
      fs.closeSync(fd);

      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];

    try {
      const userId = await redisClient.get(`auth_${token}`);
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unathorized' });
      }

      let { parentId } = req.query;
      if (parentId && parentId !== '0') {
        parentId = ObjectId(parentId);
      }

      const page = parseInt(req.query.page, 10) || 0;
      const limit = 20;
      const skip = page * limit;
      const matchQuery = { userId: ObjectId(userId) };
      if (parentId) matchQuery.parentId = parentId;

      const result = await dbClient.db.collection('files').aggregate([
        { $match: matchQuery },
        { $skip: skip },
        { $limit: limit },
      ]).toArray();

      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
