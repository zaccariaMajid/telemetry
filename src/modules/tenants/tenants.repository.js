import { ObjectId } from "mongodb";

// Data-access layer for tenants collection.
export class TenantRepository {
  constructor(fastify) {
    // Capture collection once from Fastify MongoDB plugin.
    this.collection = fastify.mongo.db.collection("tenants");
  }

  // Return all tenants.
  async getAll() {
    return this.collection.find().toArray();
  }

  // Find one tenant by name.
  async findByName(name) {
    return this.collection.findOne({ name });
  }

  // Find one tenant by Mongo ObjectId string.
  async getById(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  // Insert and return created tenant document.
  async createTenant(payload) {
    const result = await this.collection.insertOne(payload);
    return this.collection.findOne({ _id: result.insertedId });
  }

  // Update tenant by id and return updated document.
  async update(id, update) {
    if (!ObjectId.isValid(id)) return null;
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update },
    );
    return this.getById(id);
  }

  async deleteById(id) {
    if (!ObjectId.isValid(id)) return;
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
