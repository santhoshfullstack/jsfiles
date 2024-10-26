import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";

// Middleware for JWT verification
export const verifyJwt = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' });
  }
};

module.exports = {
  verifyJwt
};