
import { useCallback } from 'react';
import Papa from 'papaparse';

interface ExportData {
  filename: string;
  data: any[];
  headers?: string[];
}

export const useCSVExport = () => {
  const exportToCSV = useCallback(({ filename, data, headers }: ExportData) => {
    try {
      const csvContent = Papa.unparse(data, {
        header: true,
        columns: headers
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export CSV file');
    }
  }, []);

  const exportVenueAnalytics = useCallback((venueData: any, dateRange: string) => {
    if (!venueData) return;

    const summaryData = [{
      venue_name: venueData.venue.name,
      venue_city: venueData.venue.city,
      venue_state: venueData.venue.state,
      date_range: dateRange,
      total_revenue: venueData.totalRevenue,
      total_sessions: venueData.totalSessions,
      average_session_duration_minutes: Math.round(venueData.averageSessionDuration / 60),
      rfid_revenue: venueData.revenueByPaymentMethod.rfid,
      upi_revenue: venueData.revenueByPaymentMethod.upi
    }];

    exportToCSV({
      filename: `venue-analytics-${venueData.venue.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
      data: summaryData
    });
  }, [exportToCSV]);

  const exportSessionDetails = useCallback((sessionDetails: any[], venueName: string) => {
    exportToCSV({
      filename: `session-details-${venueName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
      data: sessionDetails
    });
  }, [exportToCSV]);

  const exportDailyRevenue = useCallback((dailyRevenue: any[], venueName: string) => {
    exportToCSV({
      filename: `daily-revenue-${venueName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
      data: dailyRevenue
    });
  }, [exportToCSV]);

  const exportGamePerformance = useCallback((topGames: any[], venueName: string) => {
    exportToCSV({
      filename: `game-performance-${venueName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
      data: topGames
    });
  }, [exportToCSV]);

  return {
    exportToCSV,
    exportVenueAnalytics,
    exportSessionDetails,
    exportDailyRevenue,
    exportGamePerformance
  };
};
