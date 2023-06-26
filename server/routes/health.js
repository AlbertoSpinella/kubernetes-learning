import mongoose from 'mongoose';
import { createClient } from 'redis';

const mongodbEndpoint = process.env.mongoDBEndpoint;
const redisEndpoint = process.env.redisEndpoint;


export const mainHealthController = (req, res) => res.send({ result: "Server is fine!" });

export const mongoHealthController = async (req, res) => {
    const connectionTimeoutMs = 1000;

    async function connectToMongoDB() {
        const timeout = setTimeout(() => {
            console.error('MongoDB connection timeout');
            mongoose.connection.close();
            return res.status(500).send({ result: "Mongo unreachable!"});
        }, connectionTimeoutMs);
    
        await mongoose.connect(mongodbEndpoint, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: connectionTimeoutMs,
        });
    
        clearTimeout(timeout);
        console.log('Connected to MongoDB');
    }
    await connectToMongoDB();
    return res.send({ result: "Mongo is fine!"});
};

export const redisHealthController = async (req, res) => {

    const client = createClient({ url: redisEndpoint });

    client.on('error', err => {
        console.log('Redis Client Error', err);
        return res.status(500).send({ result: "Redis unreachable!"});
    });

    await client.connect();

    return res.send({ result: "Redis is fine!"});
};

export const mainHealthSchema = {
    schema: {
        response: {
            200: {
                type: "object",
                required: ["result"],
                properties: {
                    result: { type: "string" }
                }
            }
        }
    },
    handler: mainHealthController
};

export const mongoHealthSchema = {
    schema: {
        response: {
            200: {
                type: "object",
                required: ["result"],
                properties: {
                    result: { type: "string" }
                }
            }
        }
    },
    handler: mongoHealthController
};

export const redisHealthSchema = {
    schema: {
        response: {
            200: {
                type: "object",
                required: ["result"],
                properties: {
                    result: { type: "string" }
                }
            }
        }
    },
    handler: redisHealthController
};

export const healthPlugin = (fastify, options, done) => {
    fastify.get("/", mainHealthSchema);
    fastify.get("/mongo", mongoHealthSchema);
    fastify.get("/redis", redisHealthSchema);

    done();
};