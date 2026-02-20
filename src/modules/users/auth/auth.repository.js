// Data-access layer for users collection.
export class AuthRepository {
  constructor(fastify) {
    // Capture collection once from Fastify MongoDB plugin.
    this.collection = fastify.mongo.db.collection('refreshTokens')
  }

  // Find one refresh token by token string.
  async findByToken(token) {
    return this.collection.findOne({ refreshToken: token })
  }

  // Insert a new refresh token record.
  async saveRefreshToken(payload) {
    const result = await this.collection.insertOne(payload)
    return this.collection.findOne({ _id: result.insertedId })
  }

  // Delete refresh token by token string.
  async deleteRefreshToken(token) {
    await this.collection.deleteOne({ refreshToken: token })
  }
}
