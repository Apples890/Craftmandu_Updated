import 'dotenv/config';
import app from './app';
import { logger } from './config/logger.config';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
