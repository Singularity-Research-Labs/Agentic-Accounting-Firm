import { Router } from 'express';
import { z } from 'zod';
import { accountingService } from '../services/accounting/accounting-service';
import { validateRequest, requireAuth } from '../middleware';
import { transactionSchemas, commonSchemas } from './index';
import { asyncHandler } from '../utils/errors';
import { accountingLogger as logger } from '../utils/logger';

const router = Router();

// Get all transactions
router.get(
  '/',
  requireAuth,
  validateRequest(z.object({
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
    const { startDate, endDate, category, status, minAmount, maxAmount } = req.query;

    logger.info('Getting transactions', {
      startDate,
      endDate,
      category,
      status,
      minAmount,
      maxAmount,
    });

    const transactions = await accountingService.getTransactions({
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

// Get transaction by ID
router.get(
  '/:id',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Getting transaction by ID', { id });

    const transaction = await accountingService.getTransaction(id);

    res.json({
      success: true,
      data: transaction,
    });
  })
);

// Create transaction
router.post(
  '/',
  requireAuth,
  validateRequest(z.object({
    body: transactionSchemas.createTransaction,
  })),
  asyncHandler(async (req, res) => {
    logger.info('Creating transaction', { transaction: req.body });

    const transaction = await accountingService.createTransaction(req.body);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  })
);

// Update transaction
router.put(
  '/:id',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
    body: transactionSchemas.updateTransaction,
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Updating transaction', { id, updates: req.body });

    const transaction = await accountingService.updateTransaction(id, req.body);

    res.json({
      success: true,
      data: transaction,
    });
  })
);

// Delete transaction
router.delete(
  '/:id',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Deleting transaction', { id });

    await accountingService.deleteTransaction(id);

    res.status(204).send();
  })
);

// Categorize transaction
router.post(
  '/:id/categorize',
  requireAuth,
  validateRequest(z.object({
    params: commonSchemas.idParam,
    body: z.object({
      category: z.string().min(1),
    }),
  })),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { category } = req.body;

    logger.info('Categorizing transaction', { id, category });

    const transaction = await accountingService.categorizeTransaction(id, category);

    res.json({
      success: true,
      data: transaction,
    });
  })
);

export const transactionRoutes = router;
