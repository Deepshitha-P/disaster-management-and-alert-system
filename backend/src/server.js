import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import disasterRoutes from './routes/disaster.routes.js';
import sosRoutes from './routes/sos.routes.js';
import mapRoutes from "./routes/map.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Attach io to app so routes can access it
app.set("io", io);

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('Disaster Management API running'));

app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/map', mapRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server listening on :${PORT}`)
  );
});
