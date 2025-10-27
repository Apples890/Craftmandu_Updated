import 'dotenv/config';
import app from './app';
import { logger } from './config/logger.config';

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
