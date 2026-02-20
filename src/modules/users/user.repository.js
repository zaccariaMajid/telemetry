import { ObjectId } from 'mongodb'

// Get reference to the users collection from the Fastify MongoDB instance
const usersCollection = (fastify) => fastify.mongo.db.collection('users')

// Retrieve all users from the collection
export const getAll = async (fastify) => usersCollection(fastify).find().toArray()

// Find a user by their email address
export const findByEmail = async (fastify, email) => usersCollection(fastify).findOne({ email })

// Retrieve a user by their ID
export const getById = async (fastify, id) => {
  if (!ObjectId.isValid(id)) return null
  return usersCollection(fastify).findOne({ _id: new ObjectId(id) })
}

// Create a new user and return the created document
export const createUser = async (fastify, payload) => {
  const result = await usersCollection(fastify).insertOne(payload)
  return usersCollection(fastify).findOne({ _id: result.insertedId })
}
