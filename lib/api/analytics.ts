import { apiClient } from './client';

export interface AnalyticsOverview {
  totalContent: number;
  totalRevenue: number;
  activeUsers: number;
  conversionRate: number;
  contentChange?: number;
  revenueChange?: number;
  usersChange?: number;
  conversionChange?: number;
}

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  totalContent: number;
  totalRevenue: number;
  kioskCount: number;
  contentPCCount: number;
  scheduleStats: {
    total: number;
    active: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

export interface ComparisonData {
  period1: {
    startDate: string;
    endDate: string;
    metrics: {
      totalContent: number;
      totalRevenue: number;
      activeUsers: number;
      conversionRate: number;
    };
  };
  period2: {
    startDate: string;
    endDate: string;
    metrics: {
      totalContent: number;
      totalRevenue: number;
      activeUsers: number;
      conversionRate: number;
    };
  };
  changes: {
    contentChange: number;
    revenueChange: number;
    usersChange: number;
    conversionChange: number;
  };
}

export const analyticsApi = {
  getOverview: async (projectId?: string): Promise<AnalyticsOverview> => {
    try {
      // Get projects for aggregation
      const projectsResponse = await apiClient.get('/projects', {
        params: projectId ? { search: projectId } : {},
      });
      const projects = projectsResponse.data?.data || projectsResponse.data || [];
      const projectList = Array.isArray(projects) ? projects : projects.data || [];

      // Calculate totals
      const totalContent = projectList.reduce(
        (sum: number, p: any) => sum + (p.totalContent || 0),
        0,
      );
      const totalRevenue = projectList.reduce(
        (sum: number, p: any) => sum + (p.totalRevenue || 0),
        0,
      );

      // Get schedule statistics
      const scheduleParams: any = {};
      if (projectId) scheduleParams.projectId = projectId;
      const scheduleResponse = await apiClient.get('/schedules/statistics', {
        params: scheduleParams,
      });
      const scheduleStats = scheduleResponse.data?.data || scheduleResponse.data || {};

      // Calculate active users (approximate from schedules)
      const activeUsers = scheduleStats.active || 0;

      // Calculate conversion rate (simplified)
      const conversionRate =
        scheduleStats.total > 0
          ? ((scheduleStats.completed || 0) / scheduleStats.total) * 100
          : 0;

      return {
        totalContent,
        totalRevenue,
        activeUsers,
        conversionRate: Math.round(conversionRate * 10) / 10,
      };
    } catch (error) {
      console.error('Failed to get analytics overview:', error);
      return {
        totalContent: 0,
        totalRevenue: 0,
        activeUsers: 0,
        conversionRate: 0,
      };
    }
  },

  getProjectAnalytics: async (projectId?: string): Promise<ProjectAnalytics[]> => {
    try {
      const projectsResponse = await apiClient.get('/projects');
      const projects = projectsResponse.data?.data || projectsResponse.data || [];
      const projectList = Array.isArray(projects) ? projects : projects.data || [];

      const filteredProjects = projectId
        ? projectList.filter((p: any) => p.id === projectId)
        : projectList;

      const analyticsPromises = filteredProjects.map(async (project: any) => {
        const scheduleResponse = await apiClient.get('/schedules/statistics', {
          params: { projectId: project.id },
        });
        const scheduleStats = scheduleResponse.data?.data || scheduleResponse.data || {};

        return {
          projectId: project.id,
          projectName: project.name,
          totalContent: project.totalContent || 0,
          totalRevenue: project.totalRevenue || 0,
          kioskCount: project.kiosks?.length || 0,
          contentPCCount: project.contentPcs?.length || 0,
          scheduleStats: {
            total: scheduleStats.total || 0,
            active: scheduleStats.active || 0,
            pending: scheduleStats.pending || 0,
            completed: scheduleStats.completed || 0,
            cancelled: scheduleStats.cancelled || 0,
          },
        };
      });

      return Promise.all(analyticsPromises);
    } catch (error) {
      console.error('Failed to get project analytics:', error);
      return [];
    }
  },

  getComparison: async (
    comparisonType: 'period' | 'project' | 'kiosk',
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string,
    projectId1?: string,
    projectId2?: string,
  ): Promise<ComparisonData> => {
    try {
      // For now, return mock data structure
      // In a real implementation, you would fetch historical data
      const period1Metrics = await analyticsApi.getOverview(projectId1);
      const period2Metrics = await analyticsApi.getOverview(projectId2);

      const contentChange =
        period1Metrics.totalContent > 0
          ? ((period2Metrics.totalContent - period1Metrics.totalContent) /
              period1Metrics.totalContent) *
            100
          : 0;
      const revenueChange =
        period1Metrics.totalRevenue > 0
          ? ((period2Metrics.totalRevenue - period1Metrics.totalRevenue) /
              period1Metrics.totalRevenue) *
            100
          : 0;
      const usersChange =
        period1Metrics.activeUsers > 0
          ? ((period2Metrics.activeUsers - period1Metrics.activeUsers) /
              period1Metrics.activeUsers) *
            100
          : 0;
      const conversionChange =
        period1Metrics.conversionRate > 0
          ? period2Metrics.conversionRate - period1Metrics.conversionRate
          : 0;

      return {
        period1: {
          startDate: period1Start,
          endDate: period1End,
          metrics: {
            totalContent: period1Metrics.totalContent,
            totalRevenue: period1Metrics.totalRevenue,
            activeUsers: period1Metrics.activeUsers,
            conversionRate: period1Metrics.conversionRate,
          },
        },
        period2: {
          startDate: period2Start,
          endDate: period2End,
          metrics: {
            totalContent: period2Metrics.totalContent,
            totalRevenue: period2Metrics.totalRevenue,
            activeUsers: period2Metrics.activeUsers,
            conversionRate: period2Metrics.conversionRate,
          },
        },
        changes: {
          contentChange: Math.round(contentChange * 10) / 10,
          revenueChange: Math.round(revenueChange * 10) / 10,
          usersChange: Math.round(usersChange * 10) / 10,
          conversionChange: Math.round(conversionChange * 10) / 10,
        },
      };
    } catch (error) {
      console.error('Failed to get comparison data:', error);
      throw error;
    }
  },
};

