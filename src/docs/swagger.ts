export const swaggerDefinition = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Adaptive test",
      version: "1.0.0",
      description: "Adaptive test backend API documentation",
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "authorization",
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:5000/api/v1/",
        description: "local server",
      },
    ],
  },
  apis: ["**/*.ts", "src/**/*.js"],
};
