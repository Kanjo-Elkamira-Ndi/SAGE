import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './auth.controller';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './auth.schema';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), ctrl.register);
authRoutes.post('/login', validate(loginSchema), ctrl.login);
authRoutes.post('/refresh', ctrl.refresh);
authRoutes.post('/logout', requireAuth, ctrl.logout);
authRoutes.get('/me', requireAuth, ctrl.me);
authRoutes.post('/forgot-password', validate(forgotPasswordSchema), ctrl.forgotPassword);
authRoutes.post('/reset-password', validate(resetPasswordSchema), ctrl.resetPassword);
