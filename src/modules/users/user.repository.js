import { ObjectId } from 'mongodb'

const usersCollection = (fastify) => fastify.mongo.db.collection('users')

export const getAll = async (fastify) => usersCollection(fastify).find().toArray()

export const getById = async (fastify, id) => {
  if (!ObjectId.isValid(id)) return null
  return usersCollection(fastify).findOne({ _id: new ObjectId(id) })
}

export const createUser = async (fastify, payload) => {
  const result = await usersCollection(fastify).insertOne(payload)
  return usersCollection(fastify).findOne({ _id: result.insertedId })
}
