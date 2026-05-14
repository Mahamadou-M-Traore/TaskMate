const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'TaskMate API',
      version:     '1.0.0',
      description: 'Personal Task Manager REST API — SAD Course Project',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local dev server' }],
  },
  apis: ['./backend/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
