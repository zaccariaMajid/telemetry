import { buildDeviceController } from "./device.controller.js";
import { deviceCreateSchema } from "./validation/device.creation.js";

// Route registration for devices module.
async function deviceRoutes(fastify, options) {
  const { deviceService } = options;
  if (!deviceService) {
    throw new Error("deviceService is required for deviceRoutes");
  }

  const { getAllDevices, getDeviceById, createDevice } = buildDeviceController({
    deviceService,
  });

  // GET routes
  fastify.get("/check", async () => ({ hello: "world" }));
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate(["admin"])] },
    getAllDevices,
  );
  fastify.get(
    "/:id",
    { onRequest: [fastify.authenticate(["admin"])] },
    getDeviceById,
  );
  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate(["admin"])],
      schema: { body: deviceCreateSchema },
    },
    createDevice,
  );
}

export default deviceRoutes;
