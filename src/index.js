import sequelize from './db';
import Fastify from 'fastify';
import User from './models/User';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import Message from './models/Message';
import messages from './validations/messages';

const fastify = Fastify({ logger: true });

fastify.register(import('fastify-cookie'));
fastify.register(import('fastify-multipart'), {
  addToBody: true,
});
fastify.register(import('fastify-cors'));

const secret = 'secret';

fastify.post(
  '/register',
  {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            type: 'string',
            minLength: 4,
            maxLength: 50,
          },
          email: {
            type: 'string',
            minLength: 4,
            maxLength: 50,
          },
          password: {
            type: 'string',
            minLength: 4,
            maxLength: 10,
          },
        },
      },
    },
  },
  async (request, reply) => {
    const { username, email, password } = request.body;
    const user = new User({
      username,
      email,
      password: await hash(password, 10),
    });

    await user.save();
    reply.send({});
  }
);

fastify.post(
  '/login',
  {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            minLength: 4,
            maxLength: 50,
          },
          password: {
            type: 'string',
            minLength: 4,
            maxLength: 10,
          },
        },
      },
    },
  },
  async (request, reply) => {
    const { email, password } = request.body;
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (user && (await compare(password, user.password))) {
      return reply.send({
        token: await sign({ id: user.id, email: user.email }, secret, {
          expiresIn: '24h',
        }),
        email: user.email,
        username: user.username,
      });
    }

    reply.status(403).send({ info: 'not correct input' });
  }
);

fastify.register((instance, {}, done) => {
  instance.addHook('onRequest', async (request, reply) => {
    const { authorization } = request.headers;
    const userObj = await verify(authorization, secret);

    if (userObj) {
      request.user = await User.findOne({
        where: {
          id: userObj.id,
        },
      });
    } else {
      reply.status(403).send({ info: 'not correct token' });
    }
  });

  instance.get('/messages', async (request, reply) => {
    const { user } = request;
    const messages = await Message.findAll({
      where: {
        userId: user.id,
		  username: user.username,
      },
    });
	 if(messages) {
		reply.send(messages);
	 }
	 reply.status(404).send({info: 'Messages not found'});
  });

  instance.post('/messages', messages, async (request, reply) => {
    const {
      body: { message },
      user,
    } = request;
    const newMessage = new Message({
      message,
      userId: user.id,
		username: user.username,
    });

    await newMessage.save();

    reply.send(
      await Message.findAll({
        where: {
          userId: user.id,
        },
      })
    );
  });

  instance.put('/messages/:id', messages, async (request, reply) => {
    const {
      body: { message },
      user,
      params: { id },
    } = request;
    const newMessage = await Message.findOne({ where: { id, userId: user.id } });

    if (newMessage) {
      await newMessage.update({ message });

      await newMessage.save();

      return reply.send(newMessage);
    }

    reply.status(404).send({ info: 'message does not exist' });
  });

  instance.delete(
    '/messages/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        user,
        params: { id },
      } = request;
      const newMessage = await Message.findOne({ where: { id, userId: user.id } });

      if (newMessage) {
        await newMessage.destroy();

        await newMessage.save();

        return reply.send(
          await Message.findAll({ where: { userId: user.id } })
        );
      }

      reply.status(404).send({ info: 'message does not exist' });
    }
  );

  done();
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await fastify.listen(3001);
  } catch (error) {
    console.log(error);
  }
};

start();
