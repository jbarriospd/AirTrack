import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const flightStatuses = sqliteTable('flight_statuses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  flightNumber: text('flight_number').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD format
  from: text('from').notNull(), // Origin airport/city code
  to: text('to').notNull(), // destination airport/city code
  status: text('status'), // 'Scheduled', 'Delayed', 'Departed', 'Landed', etc.
  etd: text('etd'), // Expected departure time (HH:MM format)
  atd: text('atd'), // Actual departure time (HH:MM format)
  delayCategory: text('delay_category'), // 'On Time', 'Minor Delay', etc.
  lastUpdated: text('last_updated').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
}, (table) => ({
  // Indexes for common queries
  flightDateIdx: index('idx_flight_date').on(table.flightNumber, table.date),
  statusIdx: index('idx_status').on(table.status),
  dateIdx: index('idx_date').on(table.date),
}));

// Types for TypeScript
export type FlightStatus = typeof flightStatuses.$inferSelect;
export type NewFlightStatus = typeof flightStatuses.$inferInsert;
