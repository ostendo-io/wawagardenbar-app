'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { FinancialReportService } from '@/services/financial-report-service';

/**
 * Generate daily summary report
 */
export async function generateDailyReportAction(date: Date) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only super-admin and admin can view reports
    if (session.role !== 'super-admin' && session.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const report = await FinancialReportService.generateDailySummary(date);

    return {
      success: true,
      report: JSON.parse(JSON.stringify(report)),
    };
  } catch (error) {
    console.error('Error generating daily report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    };
  }
}

/**
 * Generate date range report
 */
export async function generateDateRangeReportAction(startDate: Date, endDate: Date) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Only super-admin and admin can view reports
    if (session.role !== 'super-admin' && session.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const report = await FinancialReportService.generateDateRangeReport(startDate, endDate);

    return {
      success: true,
      report: JSON.parse(JSON.stringify(report)),
    };
  } catch (error) {
    console.error('Error generating date range report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    };
  }
}
