import { Router } from 'express';
import { z } from 'zod';
import { accountingService } from '../services/accounting/accounting-service';
import { validateRequest, requireAuth } from '../middleware';
import { accountSchemas, commonSchemas } from './index';
import { asyncHandler } from '../utils/errors';
import { accountingLogger as logger } from '../utils/logger';

const router = Router();

// Get all accounts
router.get(
  '/',
  requireAuth,
  validateRequest(z.object({
    query: z.object({
      type: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }),
  })),
  asyncHandler(async (req, res) => {
    logger.info('Getting all accounts');

    const accounts = await accountingService.getAccounts();

    res.json({
      success: true,
      data: accounts,
    });
  })
);

// Get account by ID
router.get(
  '/:id',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Getting account by ID', { id });

    const account = await accountingService.getAccount(id);

    res.json({
      success: true,
      data: account,
    });
  })
);

// Create account
router.post(
  '/',
  requireAuth,
  validateRequest(z.object({
    body: accountSchemas.createAccount,
  })),
  asyncHandler(async (req, res) => {
    logger.info('Creating account', { account: req.body });

    const account = await accountingService.createAccount(req.body);

    res.status(201).json({
      success: true,
      data: account,
    });
  })
);

// Update account
router.put(
  '/:id',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
    body: accountSchemas.updateAccount,
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Updating account', { id, updates: req.body });

    const account = await accountingService.updateAccount(id, req.body);

    res.json({
      success: true,
      data: account,
    });
  })
);

// Delete account
router.delete(
  '/:id',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Deleting account', { id });

    await accountingService.deleteAccount(id);

    res.status(204).send();
  })
);

// Get account transactions
router.get(
  '/:id/transactions',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      category: z.string().optional(),
      status: z.string().optional(),
      minAmount: z.string().transform(Number).optional(),
      maxAmount: z.string().transform(Number).optional(),
    }),
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate, category, status, minAmount, maxAmount } = req.query;

    logger.info('Getting account transactions', {
      id,
      startDate,
      endDate,
      category,
      status,
      minAmount,
      maxAmount,
    });

    const transactions = await accountingService.getTransactions({
      accountId: id,
      startDate: startDate as string,
      endDate: endDate as string,
      category: category as string,
      status: status as string,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    });

    res.json({
      success: true,
      data: transactions,
    });
  })
);

// Get account balance
router.get(
  '/:id/balance',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Getting account balance', { id });

    const account = await accountingService.getAccount(id);

    res.json({
      success: true,
      data: {
        balance: account.balance,
        currency: account.currency,
        lastUpdated: account.lastUpdated,
      },
    });
  })
);

export const accountRoutes = router;
