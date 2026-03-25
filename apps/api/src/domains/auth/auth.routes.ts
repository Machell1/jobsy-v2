import { Router } from 'express';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '@jobsy/shared';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as handlers from './auth.handlers';

const router = Router();

router.post('/register', validate(RegisterSchema), handlers.register);
router.post('/login', validate(LoginSchema), handlers.login);
router.post('/refresh', handlers.refresh);
router.post('/logout', requireAuth, handlers.logout);
router.post('/forgot-password', validate(ForgotPasswordSchema), handlers.forgotPassword);
router.post('/reset-password', validate(ResetPasswordSchema), handlers.resetPassword);
router.post('/verify-email', validate(VerifyEmailSchema), handlers.verifyEmail);
router.get('/me', requireAuth, handlers.getMe);

export default router;
