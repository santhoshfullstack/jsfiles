import { AppDataSource } from "./src/config/db";
import { User } from "./src/entities/User";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

export const userService = {
  // Create a new user in the database
  createUser: async (name, email) => {
    const userRepository = AppDataSource.getRepository(User);

    const newUser = new User();
    newUser.name = name;
    newUser.email = email;

    // Save the new user to the database
    const savedUser = await userRepository.save(newUser);
    return savedUser;
  },

  // **New Method**: Get all users from the database
  getAllUsers: async () => {
    const userRepository = AppDataSource.getRepository(User);

    // Fetch all users
    const users = await userRepository.find();
    return users;
  },

  // Update an existing user
  updateUser: async (
    id,
    name,
    email
  )=> {
    const userRepository = AppDataSource.getRepository(User);

    // Find the user by ID
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new Error("User not found");
    }

    // Update the user's fields only if values are provided
    if (name) user.name = name;
    if (email) user.email = email;

    // Save the updated user back to the database
    const updatedUser = await userRepository.save(user);
    return updatedUser;
  },

  // Delete a user by ID
  deleteUser: async (id) => {
    const userRepository = AppDataSource.getRepository(User);

    // Find the user by ID
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new Error("User not found");
    }

    // Delete the user from the database
    await userRepository.remove(user);
  },

  // Optional: Add a method to fetch a user by ID
  getUserById: async (id) => {
    const userRepository = AppDataSource.getRepository(User);

    // Find the user by ID
    const user = await userRepository.findOneBy({ id });
    return user;
  },
};

@Entity()
export class Admin extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!;

  @Column()
  name!;

  @Column()
  email!;

  @Column()
  phone!;
}

