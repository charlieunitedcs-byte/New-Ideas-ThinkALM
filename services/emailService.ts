// Email Service - Send emails via API
// This service provides a simple interface to send various types of emails

export interface EmailOptions {
  type: 'client-signup' | 'report' | 'notification';
  to: string;
  data: {
    // For client signup
    signupLink?: string;
    companyName?: string;
    contactName?: string;

    // For reports
    reportType?: string;
    reportData?: any;
    attachmentUrl?: string;

    // For notifications
    subject?: string;
    message?: string;
  };
}

/**
 * Send an email via the serverless API
 */
export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Email sent successfully to:', options.to);
      return { success: true };
    } else {
      console.error('❌ Failed to send email:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: 'Network error' };
  }
};

/**
 * Send a call analysis report via email
 */
export const sendCallReport = async (
  to: string,
  reportData: {
    callId: string;
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    transcript?: string;
    date: string;
  }
): Promise<void> => {
  await sendEmail({
    type: 'report',
    to: to,
    data: {
      reportType: 'Call Analysis',
      reportData: {
        score: reportData.score,
        summary: reportData.summary,
        strengths: reportData.strengths,
        improvements: reportData.improvements,
        date: reportData.date
      }
    }
  });
};

/**
 * Send team performance report via email
 */
export const sendTeamReport = async (
  to: string,
  reportData: {
    teamName: string;
    period: string;
    totalCalls: number;
    averageScore: number;
    topPerformers: Array<{ name: string; score: number }>;
    summary: string;
  }
): Promise<void> => {
  await sendEmail({
    type: 'report',
    to: to,
    data: {
      reportType: 'Team Performance',
      reportData: reportData
    }
  });
};

/**
 * Send a custom notification email
 */
export const sendNotification = async (
  to: string,
  subject: string,
  message: string
): Promise<void> => {
  await sendEmail({
    type: 'notification',
    to: to,
    data: {
      subject: subject,
      message: message
    }
  });
};
