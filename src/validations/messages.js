export default {
  schema: {
    body: {
      type: 'object',
      required: [ 'message' ],
      properties: {
			message: {
          type: 'string',
          minLength: 1,
          maxLength: 500,
        },
		  author: {
			type: 'string',
			minLength: 4,
			maxLength: 50,
		 },
      },
    },
  },
};
