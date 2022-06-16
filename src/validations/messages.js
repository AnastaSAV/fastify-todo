export default {
  schema: {
    body: {
      type: 'object',
      required: [ 'message', 'username' ],
      properties: {
			message: {
          type: 'string',
          minLength: 1,
          maxLength: 500,
        },
		  username: {
			type: 'string',
			minLength: 1,
			maxLength: 30,
		 },
      },
    },
  },
};
