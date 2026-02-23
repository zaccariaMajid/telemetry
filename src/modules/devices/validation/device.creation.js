export const deviceCreateSchema = {
  type: "object",
  required: ["tenantId","name", "type"],
  additionalProperties: false,
  properties: {
    tenantId: { type: "string", minLength: 1 },

    deviceId: { type: "string", minLength: 1 },     // es. "cnc-03"
    name: { type: "string", minLength: 2 },         // es. "CNC 03 Line A"
    type: { type: "string", minLength: 2 },         // es. "CNC", "3D Printer", "Sensor"

    location: {
      type: "object",
      additionalProperties: false,
      properties: {
        site: { type: "string" },                   // es. "Plant 1"
        area: { type: "string" }                    // es. "Line A"
      }
    },

    status: {
      type: "string",
      enum: ["online", "offline", "maintenance"],
      default: "offline"
    },
    lastPing: { type: "string", format: "date-time" }
  }
};



