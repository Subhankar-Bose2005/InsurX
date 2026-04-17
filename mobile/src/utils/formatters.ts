/**
 * Format a number as Indian Rupees (₹1,234.56)
 */
export function formatCurrency(amount: number, decimals = 0): string {
  if (isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format paise to rupees display string
 */
export function paiseToRupees(paise: number): string {
  return formatCurrency(paise / 100);
}

/**
 * Format ISO date string to readable date
 * e.g. "2026-04-03T10:30:00Z" → "03 Apr 2026"
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date string to short relative label
 * e.g. "Mon", "Today", "Yesterday"
 */
export function formatRelativeDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    }
    return formatDate(isoString);
  } catch {
    return isoString || '—';
  }
}

/**
 * Format a date for display in the "Last payout: ₹280 (Mon)" style
 */
export function formatPayoutDate(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-IN', { weekday: 'short' });
  } catch {
    return '';
  }
}

/**
 * Format policy end date countdown
 * e.g. "Expires in 3 days" or "Expires today" or "Expired"
 */
export function formatPolicyExpiry(endDate: string): string {
  try {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  } catch {
    return '';
  }
}

/**
 * Truncate long strings
 */
export function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Format a trigger type to a human-readable label with emoji
 */
export function formatTriggerType(type: string): { label: string; emoji: string; color: string } {
  const map: Record<string, { label: string; emoji: string; color: string }> = {
    heavy_rainfall: { label: 'Heavy Rainfall', emoji: '🌧️', color: '#3B82F6' },
    extreme_heat: { label: 'Extreme Heat', emoji: '🌡️', color: '#EF4444' },
    severe_aqi: { label: 'Severe AQI', emoji: '😷', color: '#A855F7' },
    flooding: { label: 'Flooding', emoji: '🌊', color: '#06B6D4' },
    curfew_bandh: { label: 'Curfew / Bandh', emoji: '🚫', color: '#F59E0B' },
  };
  return map[type] || { label: type, emoji: '⚠️', color: '#6B7280' };
}

/**
 * Format claim status to display text and color
 */
export function formatClaimStatus(status: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    approved: { label: 'Approved', color: '#16A34A', bg: '#DCFCE7' },
    paid: { label: 'Paid', color: '#0369A1', bg: '#E0F2FE' },
    flagged: { label: 'Under Review', color: '#B45309', bg: '#FEF9C3' },
    rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
  };
  return map[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
}
