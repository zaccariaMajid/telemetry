import { ObjectId } from "mongodb";

// Data-access layer for metrics collection.
export class MetricsRepository {
  constructor(fastify) {
    // Capture collection once from Fastify MongoDB plugin.
    this.collection = fastify.mongo.db.collection("metrics");
  }
  // Find one metrics document by deviceId.
  async findByDeviceId(deviceId) {
    return this.collection.findOne({ deviceId });
  }

  async getByTenantId(tenantId) {
    return this.collection.find({ tenantId }).toArray();
  }

  async countMetricsByTenantId(tenantId) {
    return this.collection.countDocuments({ tenantId });
  }

  async getMetricsByTenantId(tenantId) {
    return this.collection.find({ tenantId }).toArray();
  }

  // Delete metrics by tenantId (for tenant cleanup).
  async deleteByTenantId(tenantId) {
    return this.collection.deleteMany({ tenantId });
  }

  async getMetricsByRange(tenantId, deviceId, startTime, endTime) {
    return this.collection
      .find({
        tenantId,
        deviceId,
        createdAt: { $gte: new Date(startTime), $lte: new Date(endTime) },
      })
      .toArray();
  }

  // Insert and return created metrics document.
  async ingestMetrics(payload) {
    const result = await this.collection.insertOne(payload);
    return this.collection.findOne({ _id: result.insertedId });
  }

  async deleteMetricsByTenantId(tenantId) {
    return this.collection.deleteMany({ tenantId });
  }

  async deleteMetricsByDeviceId(tenantId, deviceId) {
    return this.collection.deleteMany({ tenantId, deviceId });
  }

  async deleteMetricsByTenantIdDeviceIdAndTimeRange(
    tenantId,
    deviceId,
    startTime,
    endTime,
  ) {
    return this.collection.deleteMany({
      tenantId,
      deviceId,
      createdAt: { $gte: new Date(startTime), $lte: new Date(endTime) },
    });
  }
}
