export const metricsIngestSchema = {
  type: "object",
  required: ["tenantId", "deviceId", "metrics"],
  additionalProperties: false,
  properties: {
    tenantId: { type: "string", minLength: 1 },        // "fab-milano"
    deviceId: { type: "string", minLength: 1 },        // "cnc-03"

    metrics: {
      type: "array",
      minItems: 1,
      maxItems: 50,  // smaller batch size to avoid hitting payload limits
      items: {
        type: "object",
        required: ["name", "value"],
        additionalProperties: false,
        properties: {
          name: { 
            type: "string", 
            minLength: 1, 
            maxLength: 32 
          },  // "temperature", "rpm"
          value: 
              { type: "number" },    // 245.3
          unit: { type: "string", maxLength: 8 }      // "°C", "g", "rpm" (opt.)
        }
      }
    }
  }
};
