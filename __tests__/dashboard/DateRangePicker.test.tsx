/**
 * Tests for DateRangePicker Component
 * Tests date selection, quick select options, and date range validation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from '@/components/ui/date-range-picker';

describe('DateRangePicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render date range picker button', () => {
    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('날짜 범위 선택')).toBeInTheDocument();
  });

  it('should display selected date range', () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');

    render(
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/2025-01-01/)).toBeInTheDocument();
    expect(screen.getByText(/2025-01-31/)).toBeInTheDocument();
  });

  it('should open picker when button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    expect(screen.getByText('날짜 범위 선택')).toBeInTheDocument();
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('종료일')).toBeInTheDocument();
  });

  it('should close picker when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    expect(screen.getByText('시작일')).toBeInTheDocument();

    // Click outside (on the overlay)
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      await user.click(overlay);
    }

    await waitFor(() => {
      expect(screen.queryByText('시작일')).not.toBeInTheDocument();
    });
  });

  it('should update start date when changed', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    const startDateInput = screen.getByLabelText('시작일');
    await user.type(startDateInput, '2025-01-01');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should update end date when changed', async () => {
    const user = userEvent.setup();
    const startDate = new Date('2025-01-01');

    render(
      <DateRangePicker
        startDate={startDate}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText(/2025-01-01/);
    await user.click(button);

    const endDateInput = screen.getByLabelText('종료일');
    await user.type(endDateInput, '2025-01-31');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should set end date max to today', async () => {
    const user = userEvent.setup();
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    const endDateInput = screen.getByLabelText('종료일');
    expect(endDateInput).toHaveAttribute('max', todayString);
  });

  it('should set end date min to start date', async () => {
    const user = userEvent.setup();
    const startDate = new Date('2025-01-15');

    render(
      <DateRangePicker
        startDate={startDate}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText(/2025-01-15/);
    await user.click(button);

    const endDateInput = screen.getByLabelText('종료일');
    expect(endDateInput).toHaveAttribute('min', '2025-01-15');
  });

  it('should apply quick select for 7 days', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    const quickSelectButton = screen.getByText('최근 7일');
    await user.click(quickSelectButton);

    expect(mockOnChange).toHaveBeenCalled();
    const callArgs = mockOnChange.mock.calls[0];
    expect(callArgs[0]).toBeInstanceOf(Date); // startDate
    expect(callArgs[1]).toBeInstanceOf(Date); // endDate
  });

  it('should apply quick select for 30 days', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    const quickSelectButton = screen.getByText('최근 30일');
    await user.click(quickSelectButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should apply quick select for 90 days', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    const quickSelectButton = screen.getByText('최근 90일');
    await user.click(quickSelectButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should apply quick select for 1 year', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    const quickSelectButton = screen.getByText('최근 1년');
    await user.click(quickSelectButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should clear dates when clear button is clicked', async () => {
    const user = userEvent.setup();
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-01-31');

    render(
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText(/2025-01-01/);
    await user.click(button);

    const clearButton = screen.getByText('초기화');
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should close picker when apply button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    expect(screen.getByText('시작일')).toBeInTheDocument();

    const applyButton = screen.getByText('적용');
    await user.click(applyButton);

    await waitFor(() => {
      expect(screen.queryByText('시작일')).not.toBeInTheDocument();
    });
  });

  it('should close picker when X button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        startDate={undefined}
        endDate={undefined}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByText('날짜 범위 선택');
    await user.click(button);

    expect(screen.getByText('시작일')).toBeInTheDocument();

    // Find and click X button (close icon)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find((btn) =>
      btn.querySelector('svg')
    );
    
    if (closeButton) {
      await user.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('시작일')).not.toBeInTheDocument();
    });
  });
});

