import mongoose from 'mongoose';
import { createClient } from 'redis';
import dynamoose from "dynamoose";

const mongodbEndpoint = process.env.mongoDBEndpoint;
const redisEndpoint = process.env.redisEndpoint;
const dynamodbEndpoint = process.env.dynamodbEndpoint;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;

export const mainHealthController = (req, res) => res.send({ result: "Server is fine!" });

export const mongoHealthController = async (req, res) => {
    const connectionTimeoutMs = 1000;

    async function connectToMongoDB() {
        const timeout = setTimeout(() => {
            console.error('MongoDB connection timeout');
            mongoose.connection.close();
            return res.status(500).send({ result: "Mongo unreachable!" });
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
    return res.send({ result: "Mongo is fine!" });
};

export const redisHealthController = async (req, res) => {

    const client = createClient({ url: redisEndpoint });

    client.on('error', err => {
        console.log('Redis Client Error', err);
        return res.status(500).send({ result: "Redis unreachable!" });
    });

    await client.connect();

    return res.send({ result: "Redis is fine!" });
};

export const dynamoHealthController = async (req, res) => {
    dynamoose.aws.ddb.local(dynamodbEndpoint);

    const db = dynamoose.aws.ddb();

    try {
        await new Promise((resolve, reject) => {
            db.listTables({}, (err, tables) => {
                if (err) {
                    console.error('Failed to connect to DynamoDB:', err);
                    reject(err);
                } else {
                    console.log('Successfully connected to DynamoDB');
                    resolve(tables);
                }
            });
        });

        return res.send({ result: "Dynamo is fine!" });   
    } catch (error) {
        return res.status(500).send({ result: "Dynamo is uncreachable!" });  
    }
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

export const dynamoHealthSchema = {
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
    handler: dynamoHealthController
};

export const healthPlugin = (fastify, options, done) => {
    fastify.get("/", mainHealthSchema);
    fastify.get("/mongo", mongoHealthSchema);
    fastify.get("/redis", redisHealthSchema);
    fastify.get("/dynamo", dynamoHealthSchema);

    done();
};