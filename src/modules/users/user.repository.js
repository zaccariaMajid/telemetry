import { ObjectId } from 'mongodb'

export class UserRepository {
  constructor(fastify) {
    this.collection = fastify.mongo.db.collection('users')
  }

  async getAll() {
    return this.collection.find().toArray()
  }

  async findByEmail(email) {
    return this.collection.findOne({ email })
  }

  async getById(id) {
    if (!ObjectId.isValid(id)) return null
    return this.collection.findOne({ _id: new ObjectId(id) })
  }

  async createUser(payload) {
    const result = await this.collection.insertOne(payload)
    return this.collection.findOne({ _id: result.insertedId })
  }
}
