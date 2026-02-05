import type { MortgageFormData } from './validation'

/**
 * Encode complete form data as a base64 string in a single URL parameter.
 * Generates URLs like: /mortgage?d=<base64>
 */
export function encodeFormDataToUrl(data: MortgageFormData): string {
  const json = JSON.stringify(data);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}/mortgage?d=${encodeURIComponent(base64)}`;
}

/**
 * Decode form data from a base64-encoded `d` query parameter.
 */
export function decodeFormDataFromUrl(searchParams: URLSearchParams): Partial<MortgageFormData> {
  const encoded = searchParams.get('d');
  if (!encoded) return {};

  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object') {
      return parsed as Partial<MortgageFormData>;
    }
  } catch {
    console.warn('Failed to decode base64 form data from URL');
  }

  return {};
}

/**
 * Generate a shareable link for the current form data.
 */
export function generateShareableLink(data: MortgageFormData): string {
  return encodeFormDataToUrl(data);
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
