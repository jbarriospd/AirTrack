import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { flightStatuses, type FlightStatus, type NewFlightStatus } from '@/db/schema';

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Format time as HH:MM
 */
const formatTime = (date: Date): string => 
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

/**
 * Check if a flight needs update based on status and time
 */
const needsUpdate = (flight: FlightStatus, nowTime: string, oneHourAgoTime: string): boolean => {
  if (flight.status === 'Landed' || flight.status === 'Departed') return false;
  if (!flight.etd) return false;
  return flight.etd >= oneHourAgoTime && flight.etd <= nowTime;
};

/**
 * Get all flight statuses for a specific date
 */
export const getFlightStatusesByDate = async (date?: string): Promise<FlightStatus[]> => {
  const db = getDb();
  const targetDate = date || getTodayString();
  
  return await db
    .select()
    .from(flightStatuses)
    .where(eq(flightStatuses.date, targetDate))
    .orderBy(desc(flightStatuses.lastUpdated));
};

/**
 * Get a specific flight by flight number and date
 */
export const getFlightByNumber = async (
  flightNumber: string,
  date?: string
): Promise<FlightStatus | null> => {
  const db = getDb();
  const targetDate = date || getTodayString();

  const results = await db
    .select()
    .from(flightStatuses)
    .where(
      and(
        eq(flightStatuses.flightNumber, flightNumber),
        eq(flightStatuses.date, targetDate)
      )
    )
    .limit(1);

  return results[0] || null;
};

/**
 * Get flights by status
 */
export const getFlightsByStatus = async (
  status: string,
  date?: string
): Promise<FlightStatus[]> => {
  const db = getDb();
  const targetDate = date || getTodayString();

  return await db
    .select()
    .from(flightStatuses)
    .where(
      and(
        eq(flightStatuses.status, status),
        eq(flightStatuses.date, targetDate)
      )
    )
    .orderBy(desc(flightStatuses.lastUpdated));
};

/**
 * Get flights within a date range
 */
export const getFlightsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<FlightStatus[]> => {
  const db = getDb();

  return await db
    .select()
    .from(flightStatuses)
    .where(
      and(
        gte(flightStatuses.date, startDate),
        lte(flightStatuses.date, endDate)
      )
    )
    .orderBy(desc(flightStatuses.date), desc(flightStatuses.lastUpdated));
};

/**
 * Get flights that need status updates
 * (flights within 1 hour of ETD that haven't departed or landed)
 */
export const getFlightsNeedingUpdate = async (date?: string): Promise<FlightStatus[]> => {
  const db = getDb();
  const targetDate = date || getTodayString();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const nowTime = formatTime(now);
  const oneHourAgoTime = formatTime(oneHourAgo);

  const allFlights = await db
    .select()
    .from(flightStatuses)
    .where(eq(flightStatuses.date, targetDate));

  return allFlights.filter(flight => needsUpdate(flight, nowTime, oneHourAgoTime));
};

/**
 * Get the most recent update timestamp for a date
 */
export const getLastUpdateTime = async (date?: string): Promise<string | null> => {
  const db = getDb();
  const targetDate = date || getTodayString();

  const results = await db
    .select({ lastUpdated: flightStatuses.lastUpdated })
    .from(flightStatuses)
    .where(eq(flightStatuses.date, targetDate))
    .orderBy(desc(flightStatuses.lastUpdated))
    .limit(1);

  return results[0]?.lastUpdated || null;
};

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Insert or update a flight status (upsert)
 */
export const upsertFlightStatus = async (flight: NewFlightStatus): Promise<FlightStatus> => {
  const db = getDb();
  const existing = await getFlightByNumber(flight.flightNumber, flight.date);

  const flightData = {
    ...flight,
    lastUpdated: new Date().toISOString(),
  };

  if (existing) {
    const updated = await db
      .update(flightStatuses)
      .set(flightData)
      .where(eq(flightStatuses.id, existing.id))
      .returning();
    
    return updated[0];
  }

  const inserted = await db
    .insert(flightStatuses)
    .values(flightData)
    .returning();
  
  return inserted[0];
};

/**
 * Bulk upsert multiple flight statuses
 */
export const upsertMultipleFlights = async (flights: NewFlightStatus[]): Promise<void> => {
  const batchSize = 50;
  
  for (let i = 0; i < flights.length; i += batchSize) {
    const batch = flights.slice(i, i + batchSize);
    await Promise.all(batch.map(upsertFlightStatus));
  }
};

/**
 * Update a specific flight by ID
 */
export const updateFlightById = async (
  id: number,
  updates: Partial<NewFlightStatus>
): Promise<FlightStatus> => {
  const db = getDb();

  const updated = await db
    .update(flightStatuses)
    .set({
      ...updates,
      lastUpdated: new Date().toISOString(),
    })
    .where(eq(flightStatuses.id, id))
    .returning();

  if (!updated[0]) {
    throw new Error(`Flight with id ${id} not found`);
  }

  return updated[0];
};

/**
 * Delete old flight records (cleanup)
 */
export const deleteFlightsBefore = async (date: string): Promise<number> => {
  const db = getDb();

  const deleted = await db
    .delete(flightStatuses)
    .where(lte(flightStatuses.date, date))
    .returning();

  return deleted.length;
};

// ============================================================================
// Aggregation Functions
// ============================================================================

/**
 * Get flight statistics for a specific date
 */
export const getFlightStats = async (date?: string): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byDelayCategory: Record<string, number>;
  needingUpdate: number;
}> => {
  const targetDate = date || getTodayString();
  const flights = await getFlightStatusesByDate(targetDate);
  const needingUpdate = await getFlightsNeedingUpdate(targetDate);

  const byStatus = flights.reduce((acc, flight) => {
    const status = flight.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byDelayCategory = flights.reduce((acc, flight) => {
    const category = flight.delayCategory || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: flights.length,
    byStatus,
    byDelayCategory,
    needingUpdate: needingUpdate.length,
  };
};