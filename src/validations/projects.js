export default {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'description'],
      properties: {
        name: {
          type: 'string',
          minLength: 4,
          maxLength: 30,
        },
        description: {
          type: 'string',
          minLength: 4,
          maxLength: 500,
        },
      },
    },
  },
};
