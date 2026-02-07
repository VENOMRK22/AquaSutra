import axios from 'axios';

/**
 * WhatsApp Notification Service using CallMeBot (FREE, no business account needed)
 * 
 * HOW IT WORKS:
 * 1. User sends "I allow callmebot to send me messages" to +34 644 71 83 81 on WhatsApp
 * 2. They receive an API key
 * 3. We use that key + their phone to send messages
 * 
 * For simplicity, we'll use a shared API key approach or store per-user keys.
 * Alternative: Use the free tier without API key (limited messages per day)
 */

interface ActivitySummary {
    title: string;
    date: string;
    type: string;
}

export class WhatsAppService {

    /**
     * Send activity notification via CallMeBot WhatsApp API
     * Phone format: Include country code, e.g., 919876543210 (no + sign)
     */
    static async sendActivityNotification(
        phoneNumber: string,
        farmName: string,
        cropName: string,
        activities: ActivitySummary[]
    ): Promise<boolean> {
        try {
            // Clean phone number (remove +, spaces, dashes)
            const cleanPhone = phoneNumber.replace(/[\s\-\+]/g, '');

            // Format message
            const taskList = activities
                .slice(0, 5) // Limit to 5 tasks
                .map(a => `📅 ${a.date}: ${a.title} (${a.type})`)
                .join('\n');

            const message = `🌾 *AquaSutra Alert*

New tasks added for *${cropName}* on *${farmName}*:

${taskList}

Check your dashboard for details!
https://aquasutra.vercel.app`;

            // CallMeBot API URL (free tier - no API key needed for basic use)
            // For production, user should register and get an API key
            const apiUrl = `https://api.callmebot.com/whatsapp.php`;

            console.log(`[WhatsApp] Sending notification to ${cleanPhone}`);

            const response = await axios.get(apiUrl, {
                params: {
                    phone: cleanPhone,
                    text: message,
                    apikey: 'free'
                }
            });

            if (response.status === 200) {
                console.log(`[WhatsApp] Notification sent successfully to ${cleanPhone}`);
                return true;
            } else {
                console.error(`[WhatsApp] Failed to send:`, response.statusText);
                return false;
            }

        } catch (error: any) {
            console.error('[WhatsApp] Error sending notification:', error.message);
            return false;
        }
    }

    /**
     * Alternative: Generate a WhatsApp click-to-chat link for manual sharing
     */
    static generateWhatsAppLink(phoneNumber: string, message: string): string {
        const cleanPhone = phoneNumber.replace(/[\s\-\+]/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }
}
