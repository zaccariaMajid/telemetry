// Builds HTTP handlers using injected dependencies.
export const buildDeviceController = ({ deviceService }) => ({
  // GET /devices
  getAllDevices: async (req, reply) => {
    const devices = await deviceService.getAllDevices();
    return reply.send(devices);
  },

  // GET /devices/:id
  getDeviceById: async (req, reply) => {
    const device = await deviceService.getDeviceById(req.params.id);
    return reply.send(device);
  },

  // POST /devices
  createDevice: async (req, reply) => {
    const device = await deviceService.createDevice(req.body);
    return reply.send(device);
  }
});
