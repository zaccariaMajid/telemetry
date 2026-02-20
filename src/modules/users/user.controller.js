export const getAll = async (req, reply) => {
  const users = await fetchUsersFromDatabase();
  reply.send(users);
};

const fetchUsersFromDatabase = async () => {
  // Simulate database fetch
  return [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
};

export const getById = async (req, reply) => {
  const user = { id: parseInt(req.params.id) };

  if (!user) return reply.status(404).send({ error: 'User not found' });
  reply.send(user);
};