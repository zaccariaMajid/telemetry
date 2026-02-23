import { ObjectId } from "mongodb";

// Data-access layer for users collection.
export class UserRepository {
  constructor(fastify) {
    // Capture collection once from Fastify MongoDB plugin.
    this.collection = fastify.mongo.db.collection("users");
  }

  // Return all users.
  async getAll() {
    return this.collection.find().toArray();
  }

  // Return number of users belonging to a tenant.
  async countByTenant(tenantId) {
    return this.collection.countDocuments({ tenantId });
  }

  // Find one user by email.
  async findByEmail(email) {
    return this.collection.findOne({ email });
  }

  // Find one user by email within a tenant.
  async findByEmailAndTenant(email, tenantId) {
    return this.collection.findOne({ email, tenantId });
  }

  // Find one user by Mongo ObjectId string.
  async getById(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  // Insert and return created user document.
  async createUser(payload) {
    const result = await this.collection.insertOne(payload);
    return this.collection.findOne({ _id: result.insertedId });
  }

  async update(id, update) {
    if (!ObjectId.isValid(id)) return null;
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update },
    );
    return this.getById(id);
  }
}
