
import { useCallback } from 'react';
import { format } from 'date-fns';

interface PDFExportData {
  venueName: string;
  timePeriod: string;
  dateRange: string;
  analytics: any;
  sessionDetails: any[];
}

export const usePDFExport = () => {
  const exportAnalyticsToPDF = useCallback(async (data: PDFExportData) => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>VR Analytics Report - ${data.venueName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #00eaff; padding-bottom: 20px; margin-bottom: 30px; }
          .title { color: #00eaff; font-size: 28px; margin-bottom: 10px; }
          .subtitle { color: #666; font-size: 16px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #00eaff; }
          .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
          .trend { font-size: 12px; margin-top: 5px; }
          .trend.positive { color: #22c55e; }
          .trend.negative { color: #ef4444; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 20px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${data.venueName}</div>
          <div class="subtitle">VR Analytics Report - ${data.timePeriod}</div>
          <div class="subtitle">${data.dateRange}</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${data.analytics.currentPeriod.sessions}</div>
            <div class="metric-label">Total Sessions</div>
            <div class="trend ${data.analytics.trends.sessionsChange >= 0 ? 'positive' : 'negative'}">
              ${data.analytics.trends.sessionsChange >= 0 ? '+' : ''}${data.analytics.trends.sessionsChange.toFixed(1)}% vs previous period
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">₹${data.analytics.currentPeriod.revenue.toLocaleString()}</div>
            <div class="metric-label">Total Revenue</div>
            <div class="trend ${data.analytics.trends.revenueChange >= 0 ? 'positive' : 'negative'}">
              ${data.analytics.trends.revenueChange >= 0 ? '+' : ''}${data.analytics.trends.revenueChange.toFixed(1)}% vs previous period
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${Math.round(data.analytics.currentPeriod.avgDuration / 60)}m</div>
            <div class="metric-label">Avg Duration</div>
            <div class="trend ${data.analytics.trends.durationChange >= 0 ? 'positive' : 'negative'}">
              ${data.analytics.trends.durationChange >= 0 ? '+' : ''}${data.analytics.trends.durationChange.toFixed(1)}% vs previous period
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.analytics.currentPeriod.uniqueCustomers}</div>
            <div class="metric-label">Unique Customers</div>
            <div class="trend ${data.analytics.trends.customersChange >= 0 ? 'positive' : 'negative'}">
              ${data.analytics.trends.customersChange >= 0 ? '+' : ''}${data.analytics.trends.customersChange.toFixed(1)}% vs previous period
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Game Performance</div>
          <table>
            <thead>
              <tr>
                <th>Game Title</th>
                <th>Sessions</th>
                <th>Revenue</th>
                <th>Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              ${data.analytics.gamePerformance.slice(0, 10).map((game: any) => `
                <tr>
                  <td>${game.gameTitle}</td>
                  <td>${game.sessions}</td>
                  <td>₹${game.revenue.toLocaleString()}</td>
                  <td>${Math.round(game.avgDuration / 60)}m</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Recent Sessions</div>
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.sessionDetails.slice(0, 20).map((session: any) => `
                <tr>
                  <td>${session.game_title}</td>
                  <td>${format(new Date(session.start_time), 'MMM d, HH:mm')}</td>
                  <td>${session.duration_seconds ? Math.floor(session.duration_seconds / 60) + 'm' : 'In progress'}</td>
                  <td>₹${session.amount_paid || 0}</td>
                  <td>${session.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated on ${format(new Date(), 'PPpp')} | NextGen Arcadia Analytics System</p>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    }
  }, []);

  return { exportAnalyticsToPDF };
};
