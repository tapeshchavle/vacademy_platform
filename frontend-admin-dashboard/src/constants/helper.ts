import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';

export const convertToLocalDateTime = (dateString: string): string => {
    if (!dateString) return '';

    // Backend sends timestamps as UTC but sometimes omits the trailing 'Z'.
    // new Date("2026-04-11T06:47:00") without a zone is parsed as *local*
    // time by modern browsers, so the conversion silently no-ops. Force UTC
    // interpretation when no zone marker is present.
    const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/i.test(dateString);
    const normalized = hasTimezone ? dateString : `${dateString.replace(' ', 'T')}Z`;
    const date = new Date(normalized);

    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };

    // Use en-GB for day-month-year ordering
    const formatted = new Intl.DateTimeFormat('en-GB', options).format(date);

    return formatted.replace(',', '').replace(/\s(am|pm)/i, (match) => match.toUpperCase());
};

export function extractDateTime(utcDate: string) {
    const [date, time] = [
        utcDate.split(' ').slice(0, 3).join(' '),
        utcDate.split(' ').slice(3).join(' '),
    ];

    return { date, time };
}

export function getInstituteId(): string | undefined {
    return getCurrentInstituteId();
}

export function getDateFromUTCString(utcString: string): string {
    const date = new Date(utcString);
    // Format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function extractTextFromHTML(htmlString: string) {
    if (!htmlString) return '';
    return htmlString.replace(/<[^>]*>/g, '');
}
