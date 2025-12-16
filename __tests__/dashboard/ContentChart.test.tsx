/**
 * Tests for ContentChart Component
 * Tests chart rendering and data display
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContentChart } from '@/components/dashboard/ContentChart';

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: jest.fn(({ data, options }) => (
    <div data-testid="content-chart">
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
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

describe('ContentChart Component', () => {
  const mockData = {
    labels: ['1월 1일', '1월 2일', '1월 3일'],
    values: [10, 20, 15],
  };

  it('should render chart with provided data', () => {
    render(<ContentChart data={mockData} />);

    expect(screen.getByTestId('content-chart')).toBeInTheDocument();
  });

  it('should format chart data correctly', () => {
    render(<ContentChart data={mockData} />);

    const chartData = screen.getByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '{}');

    expect(data.labels).toEqual(mockData.labels);
    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('생성된 콘텐츠');
    expect(data.datasets[0].data).toEqual(mockData.values);
  });

  it('should configure chart options correctly', () => {
    render(<ContentChart data={mockData} />);

    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');

    expect(options.responsive).toBe(true);
    expect(options.maintainAspectRatio).toBe(false);
    expect(options.plugins.legend.display).toBe(true);
    expect(options.scales.y.beginAtZero).toBe(true);
  });

  it('should format tooltip with count', () => {
    render(<ContentChart data={mockData} />);

    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');

    expect(options.plugins.tooltip.callbacks.label).toBeDefined();
    
    // Test tooltip callback
    const mockContext = {
      parsed: { y: 10 },
    };
    const formattedLabel = options.plugins.tooltip.callbacks.label(mockContext);
    expect(formattedLabel).toBe('생성된 콘텐츠: 10개');
  });

  it('should format y-axis ticks with count', () => {
    render(<ContentChart data={mockData} />);

    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');

    expect(options.scales.y.ticks.callback).toBeDefined();
    
    // Test y-axis callback
    const formattedTick = options.scales.y.ticks.callback(10);
    expect(formattedTick).toBe('10개');
  });

  it('should handle empty data', () => {
    const emptyData = {
      labels: [],
      values: [],
    };

    render(<ContentChart data={emptyData} />);

    expect(screen.getByTestId('content-chart')).toBeInTheDocument();
  });

  it('should apply correct chart styling', () => {
    render(<ContentChart data={mockData} />);

    const chartData = screen.getByTestId('chart-data');
    const data = JSON.parse(chartData.textContent || '{}');

    expect(data.datasets[0].backgroundColor).toBe('rgba(139, 92, 246, 0.8)');
    expect(data.datasets[0].borderColor).toBe('rgb(139, 92, 246)');
    expect(data.datasets[0].borderWidth).toBe(1);
    expect(data.datasets[0].borderRadius).toBe(4);
  });

  it('should set stepSize to 1 for y-axis', () => {
    render(<ContentChart data={mockData} />);

    const chartOptions = screen.getByTestId('chart-options');
    const options = JSON.parse(chartOptions.textContent || '{}');

    expect(options.scales.y.ticks.stepSize).toBe(1);
  });
});

