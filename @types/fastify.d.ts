// fastify.d.ts
import 'fastify';
import 'fastify-jwt';

declare module 'fastify' {
  interface FastifyRequest  {
    jwtVerify: (token: string) => Promise<any>; // You can adjust the return type as needed
    jwt: {
      sign: (payload: object, options?: object) => string;
      verify: (token: string) => object;
    };
  }
}
