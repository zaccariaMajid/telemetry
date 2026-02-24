import { BadRequestError } from "../../shared/errors/app-error.js";

// Business logic for device operations.
export class DeviceService {
  constructor(deviceRepository) {
    // Dependency is injected for testability and decoupling.
    this.deviceRepository = deviceRepository;
  }

  // Get all devices.
  async getAllDevices() {
    return this.deviceRepository.getAll();
  }

  // Get one device profile by id.
  async getDeviceById(id) {
    const device = await this.deviceRepository.getById(id);
    if (!device) {
      throw new BadRequestError("Device not found");
    }

    const deviceId = device._id?.toString?.() || device.id;

    return {
      ...device
    };
  }

  async createDevice(data) {
    const existing = await this.deviceRepository.findByNameAndTenant(data.name, data.tenantId);
    if (existing) {
      throw new BadRequestError("Device name already in use");
    }
    return this.deviceRepository.createDevice(data);
  }
}
