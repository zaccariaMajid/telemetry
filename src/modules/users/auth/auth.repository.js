// Data-access layer for users collection.
export class AuthRepository {
  constructor(fastify) {
    // Capture collection once from Fastify MongoDB plugin.
    this.collection = fastify.mongo.db.collection('refreshTokens')
  }

  // Ensure indexes needed for secure and self-cleaning refresh-token storage.
  async ensureIndexes() {
    await this.collection.createIndex(
      { refreshTokenHash: 1 },
      { unique: true, name: 'refresh_token_hash_unique' },
    )
    await this.collection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: 'refresh_token_ttl' },
    )
  }

  // Find one refresh token record by token hash.
  async findByTokenHash(refreshTokenHash) {
    return this.collection.findOne({ refreshTokenHash })
  }

  // Insert a new refresh token record.
  async saveRefreshToken(payload) {
    const result = await this.collection.insertOne(payload)
    return this.collection.findOne({ _id: result.insertedId })
  }

  // Delete refresh token by token hash.
  async deleteRefreshTokenByHash(refreshTokenHash) {
    await this.collection.deleteOne({ refreshTokenHash })
  }
}
