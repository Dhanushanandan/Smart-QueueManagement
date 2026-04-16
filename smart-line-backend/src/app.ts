import './config/firebase';
import express from 'express';
import cors from 'cors';
import queueRoutes from './routes/queue.routes';
import serviceRoutes from "./routes/service.routes";
import bookingRoutes from "./routes/booking.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./auth/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

export default app;