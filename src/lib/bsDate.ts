// Simple BS Date utilities for Panchamrit Dairy System
// Note: This is a simplified implementation for display purposes

const BS_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

const BS_MONTHS_EN = [
  'Baishakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export function formatBSDate(dateStr: string): string {
  // dateStr format: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatBSDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${year} ${BS_MONTHS_EN[month - 1]} ${day}`;
}

export function formatBSDateNepali(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${year} ${BS_MONTHS[month - 1]} ${day}`;
}

export function getCurrentBSDate(): string {
  // For demo purposes, return a fixed BS date
  // In production, you'd use a proper AD to BS conversion
  return '2081-01-20';
}

export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  
  // Simple implementation assuming same month
  if (startYear === endYear && startMonth === endMonth) {
    for (let day = startDay; day <= endDay; day++) {
      dates.push(`${startYear}-${String(startMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
  } else {
    // For cross-month ranges, we'll add dates up to day 32 for first month
    // and from day 1 for second month (simplified)
    for (let day = startDay; day <= 32; day++) {
      dates.push(`${startYear}-${String(startMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
    for (let day = 1; day <= endDay; day++) {
      dates.push(`${endYear}-${String(endMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
  }
  
  return dates;
}

export function getBSMonthName(month: number, nepali: boolean = false): string {
  return nepali ? BS_MONTHS[month - 1] : BS_MONTHS_EN[month - 1];
}
