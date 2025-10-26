// routes/index.ts
import { Router } from 'express';
import auth from './auth.routes';
import user from './user.routes';
import vendor from './vendor.routes';
import product from './product.routes';
import order from './order.routes';
import review from './review.routes';
import chat from './chat.routes';
import notification from './notification.routes';
import admin from './admin.routes';

const r = Router();

r.use('/auth', auth);
r.use('/users', user);
r.use('/vendors', vendor);
r.use('/products', product);
r.use('/orders', order);
r.use('/reviews', review);
r.use('/chat', chat);
r.use('/notifications', notification);
r.use('/admin', admin);

export default r;
