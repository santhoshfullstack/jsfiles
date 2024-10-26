import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import pool, { sequelize} from "../config/database";

// Define an interface for the request parameters
interface Params {
  id: string; // Assuming ID is a string;
}

// Secret keys for JWT and Refresh tokens (use env variables in production)
const REFRESH_TOKEN_SECRET = "your_refresh_token_secret";

// Token expiration times
const ACCESS_TOKEN_EXPIRATION = "1d"; // Access token valid for 1 day
const REFRESH_TOKEN_EXPIRATION = "7d"; // Refresh token valid for 7 days

// Create User
const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, email, password } = request.body as {
    name: string;
    email: string;
    password: string;
  };

  try {
    const user = await User.create({ name, email, password });
    reply.code(201).send(user);
  } catch (error) {
    reply.code(500).send({ message: "Error creating user", error });
  }
};

// Login User
const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  try {
    // Try to fetch the user from the slave first
    let user : User = await sequelize.models.User.findOne({
      useMaster : false,
      where: { email },
    }) as User;
    // If user is not found in the slave, fetch from the master
    if (!user) {
      console.log('inside master db query');
      user = await sequelize.models.User.findOne({
        useMaster : true,
        where: { email },
      }) as User;
    }

    // If user is still not found, send an error response
    if (!user) {
      return reply.code(401).send({ message: "Invalid email or password" });
    }

    // Check if the provided password matches the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({ message: "Invalid email or password" });
    }

    // Generate access and refresh tokens
    const accessToken = await reply.jwtSign(
      { id: user.id, email: user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );
    const refreshToken = await reply.jwtSign(
      { id: user.id, email: user.email },
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    // Log the tokens for debugging
    console.log({ accessToken, refreshToken });

    // Send the response with tokens and user data
    return reply.send({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    reply.code(500).send({
      message: "Login failed",
      error: error.message || error,
    });
  }
};

// Refresh Token
const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const { token } = request.body as { token: string };

  if (!token) {
    return reply.code(400).send({ message: "Refresh token is required" });
  }

  try {
    // Verify the refresh token using jsonwebtoken
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET); // Use jwt.verify

    // Find the user in the database using the decoded id
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return reply.code(403).send({ message: "User not found" });
    }

    // Generate new access token
    const accessToken = await reply.jwtSign(
      { id: user.id, email: user.email },
      {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      }
    );
    // Send the new access token to the client
    return reply.send({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    reply.code(500).send({ message: "Failed to refresh token", error });
  }
};

// Get All Users
const getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await User.findAll();
    reply.send(users);
  } catch (error) {
    reply.code(500).send({ message: "Failed to fetch users", error });
  }
};

// Get User By ID
const getUserById = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) => {
  const userId = Number(request.params.id); // Parse the ID as a number

  try {
    const data = await fetchDataWithFallback(userId, reply);

    if (!data) {
      reply.code(404).send({ message: "Data not found" });
    } else {
      reply.send(data);
    }
  } catch (error) {
    reply.code(500).send({ message: "An error occurred", error });
  }

  // try {
  //   const user = await User.findByPk(userId);
  //   if (!user) {
  //     return reply.code(404).send({ message: "User not found" });
  //   }
  //   reply.send(user);
  // } catch (error) {
  //   reply.code(500).send({ message: "Failed to fetch user", error });
  // }
};

// Update User By ID
const updateUserById = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) => {
  const userId = Number(request.params.id);
  const { name, email, password } = request.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    // Update fields only if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10); // Hash the password if it's updated

    await user.save(); // Save changes to the database
    reply.send(user);
  } catch (error) {
    reply.code(500).send({ message: "Failed to update user", error });
  }
};

// Delete User By ID
const deleteUserById = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply
) => {
  const userId = Number(request.params.id);

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    await user.destroy(); // Delete the user
    reply.send({ message: "User deleted successfully" });
  } catch (error) {
    reply.code(500).send({ message: "Failed to delete user", error });
  }
};

async function fetchDataWithFallback(id: number, reply: FastifyReply) {
  // try {
  //   const user = await User.findByPk(userId);
  //   if (!user) {
  //     return reply.code(404).send({ message: "User not found" });
  //   }
  //   reply.send(user);
  // } catch (error) {
  //   reply.code(500).send({ message: "Failed to fetch user", error });
  // }

  try {
    // Try reading from the slave (Sequelize defaults to slave on find queries)
    const data = await User.findOne({
      where: { id },
      // Force read from the replica
      useMaster: false,
    });

    if (data) {
      return data;
    }

    // If data is not found, fallback to reading from master
    const dataMaster = await User.findOne({
      where: { id },
      // Force read from the master
      useMaster: true,
    });

    if (dataMaster) {
      let id =  dataMaster.id;
      let email = dataMaster.email;
      let password = dataMaster.password;
      let name = dataMaster.name;
      let createdAt = dataMaster.createdAt;
      let updatedAt = dataMaster.updatedAt;

      const [result] = await pool.execute(
        'INSERT INTO users (id, email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [id, email, password, name, createdAt, updatedAt]
      );
  
      // Respond with the created user ID
      return reply.status(201).send({ id: id, email, name });
      
      // await slaveSequelize.models.User.create({
      //   id: dataMaster.id,
      //   email: dataMaster.email,
      //   password: dataMaster.password, // Ensure sensitive data is handled properly
      //   // Add other fields here as necessary
      // });
      return dataMaster;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  refreshToken,
};
