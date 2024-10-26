// routes/userRoutes.ts
import { FastifyInstance } from "fastify";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  refreshToken,
} from "../controllers/userController"; // Adjust the import based on your file structure
import { verifyJwt } from "../middlewares/authMiddleware"; // Import the JWT verification middleware

const userRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/register", createUser); // No JWT required for user creation
  fastify.post("/login", loginUser); // No JWT required for login
  
  // Protect the following routes with JWT verification
  fastify.get("/users", { preHandler: verifyJwt }, getAllUsers);
  // fastify.get("/users/:id", getUserById);
  fastify.get("/users/:id", { preHandler: verifyJwt }, getUserById);
  fastify.put("/users/:id", { preHandler: verifyJwt }, updateUserById);
  fastify.delete("/users/:id", { preHandler: verifyJwt }, deleteUserById);
  fastify.post("/refresh-token", refreshToken);;
};

export default userRoutes;
