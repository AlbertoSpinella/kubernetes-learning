import Fastify from "fastify";

import { healthPlugin } from "./routes/health.js";

const app = Fastify();

app.register(healthPlugin, { prefix: "/health" });

export default app;