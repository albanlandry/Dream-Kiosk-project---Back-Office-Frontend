/**
 * Tests for RevenueChart Component
 * Tests chart rendering and data display
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: jest.fn(({ data, options }) => (
    <div data-testid="revenue-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

// Mock Chart.js registration
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

describe('RevenueChart Component', () => {
  const mockData = {
    labels: ['1월 1일', '1월 2일', '1월 3일'],
    values: [100000, 200000, 150000],
  };

  it('should render chart with provided data', () => {
    render(<RevenueChart data={mockData} />);

    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
  });

  it('should format chart data correctly', () => {
    render(<RevenueChart data={mockData} />);

    const chartData = screen.getByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '{}');

    expect(data.labels).toEqual(mockData.labels);
    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('매출 (원)');
    expect(data.datasets[0].data).toEqual(mockData.values);
  });

  it('should configure chart options correctly', () => {
    render(<RevenueChart data={mockData} />);

    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');

    expect(options.responsive).toBe(true);
    expect(options.maintainAspectRatio).toBe(false);
    expect(options.plugins.legend.display).toBe(true);
    expect(options.scales.y.beginAtZero).toBe(true);
  });

  it('should format tooltip with currency', () => {
    render(<RevenueChart data={mockData} />);

    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');

    expect(options.plugins.tooltip.callbacks.label).toBeDefined();
    
    // Test tooltip callback
    const mockContext = {
      parsed: { y: 100000 },
    };
    const formattedLabel = options.plugins.tooltip.callbacks.label(mockContext);
    expect(formattedLabel).toBe('매출: ₩100,000');
  });

  it('should format y-axis ticks with currency', () => {
    render(<RevenueChart data={mockData} />);

    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');

    expect(options.scales.y.ticks.callback).toBeDefined();
    
    // Test y-axis callback
    const formattedTick = options.scales.y.ticks.callback(100000);
    expect(formattedTick).toBe('₩100,000');
  });

  it('should handle empty data', () => {
    const emptyData = {
      labels: [],
      values: [],
    };

    render(<RevenueChart data={emptyData} />);

    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
  });

  it('should apply correct chart styling', () => {
    render(<RevenueChart data={mockData} />);

    const chartData = screen.getByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '{}');

    expect(data.datasets[0].borderColor).toBe('rgb(236, 72, 153)');
    expect(data.datasets[0].backgroundColor).toBe('rgba(236, 72, 153, 0.1)');
    expect(data.datasets[0].fill).toBe(true);
    expect(data.datasets[0].tension).toBe(0.4);
  });
});

