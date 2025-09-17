import { NextResponse } from 'next/server';
import { updateFlightStatusesFromSheet } from '@/app/actions/updateFlightStatuses';

export async function GET() {
  try {
    const result = await updateFlightStatusesFromSheet();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update flight statuses.',
      error: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}