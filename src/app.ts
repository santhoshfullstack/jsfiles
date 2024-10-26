import Fastify from 'fastify';
import dbInit from './models';
import userRoutes from './routes/userRoutes';
import jwtPlugin from './plugins/jwt';
import fastifyJwt from "fastify-jwt";

const fastify = Fastify({ logger: true });

fastify.register(fastifyJwt, {
  secret: "your_jwt_secret_key", // Store this in a secure environment variable
});

// Register Routes
fastify.register(userRoutes);

// Database and Server Start
const start = async () => {
  try {
    await dbInit();
    await fastify.listen({ port: 3000 });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
