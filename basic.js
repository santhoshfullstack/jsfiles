const fastify = require("fastify")({ logger: true });

fastify.route({
  method: "GET",
  url: "/test",
  schema: {
    // request needs to have a querystring with a `name` parameter
    querystring: {
      type: "object",
      properties: {
        name: { type: "string" },
        id: { type: "string" },
      },
      required: ["id"],
      required: ["name"],
    },
    // the response needs to be an object with an `hello` property of type 'string'
    response: {
      200: {
        type: "object",
        properties: {
          hello: { type: "string" },
        },
      },
    },
  },
  // this function is executed for every request before the handler is executed
  preHandler: (request, reply, done) => {
    // E.g. check authentication
    done();
  },
  handler: (request, reply) => {
    const { id } = request.query;
    const { name } = request.query;
    reply.send({ hello: `Hello, ${name} ${id}!!!!` });
  },
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
