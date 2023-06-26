import app from "./app.js";

const port = 3000;
const host = '0.0.0.0';

const start = async () => {
    try {
        console.log(`Server starting...`);
        await app.listen({ port, host });
    } catch (error) {
        console.log(error);
        app.log.error(error);
        process.exit(1);      
    }
};

start();