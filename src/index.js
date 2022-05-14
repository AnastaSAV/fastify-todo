import sequelize from './db';
import Fastify from 'fastify';
import User from './models/User';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import Project from './models/Project';
import projects from './validations/projects';

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
            maxLength: 30,
          },
          email: {
            type: 'string',
            minLength: 4,
            maxLength: 30,
          },
          password: {
            type: 'string',
            minLength: 4,
            maxLength: 30,
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
            maxLength: 30,
          },
          password: {
            type: 'string',
            minLength: 4,
            maxLength: 30,
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

  instance.get('/projects', async (request, reply) => {
    const { user } = request;
    const projects = await Project.findAll({
      where: {
        userId: user.id,
      },
    });

    reply.send(projects);
  });

  instance.post('/projects', projects, async (request, reply) => {
    const {
      body: { name, description },
      user,
    } = request;
    const project = new Project({
      name,
      description,
      userId: user.id,
    });

    await project.save();

    reply.send(
      await Project.findAll({
        where: {
          userId: user.id,
        },
      })
    );
  });

  instance.put('/projects/:id', projects, async (request, reply) => {
    const {
      body: { name, description },
      user,
      params: { id },
    } = request;
    const project = await Project.findOne({ where: { id, userId: user.id } });

    if (project) {
      await project.update({ name, description });

      await project.save();

      return reply.send(project);
    }

    reply.status(404).send({ info: 'project does not exist' });
  });

  instance.delete(
    '/projects/:id',
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
      const project = await Project.findOne({ where: { id, userId: user.id } });

      if (project) {
        await project.destroy();

        await project.save();

        return reply.send(
          await Project.findAll({ where: { userId: user.id } })
        );
      }

      reply.status(404).send({ info: 'project does not exist' });
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
