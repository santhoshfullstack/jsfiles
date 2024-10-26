import fp from "fastify-plugin";
import fastifyJwt from "fastify-jwt";

fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: "your_jwt_secret_key", // Store this in a secure environment variable
  });
});

export default fp;