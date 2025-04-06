import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import StickyNote from './StickyNote';
import { Note } from '../types';

// Mock the canvas-confetti library
jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('StickyNote Component', () => {
  const mockNote: Note = {
    id: '1',
    content: 'Test note content',
    createdAt: Date.now(),
    color: '#ffeb3b',
    completed: false,
    archived: false
  };

  const mockProps = {
    note: mockNote,
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
    onColorChange: jest.fn(),
    onComplete: jest.fn(),
    isCompleted: false,
    autoFocus: false,
    isArchiving: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders note content', () => {
    render(<StickyNote {...mockProps} />);
    expect(screen.getByDisplayValue('Test note content')).toBeInTheDocument();
  });

  test('calls onUpdate when content is changed', () => {
    render(<StickyNote {...mockProps} />);
    
    const textarea = screen.getByDisplayValue('Test note content');
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    
    expect(mockProps.onUpdate).toHaveBeenCalledWith('1', 'Updated content');
  });

  test('calls onColorChange when color is changed', () => {
    render(<StickyNote {...mockProps} />);
    
    // Find and click a color button (assuming there's a color picker)
    const colorButton = screen.getByLabelText(/Change color to pink/i);
    fireEvent.click(colorButton);
    
    expect(mockProps.onColorChange).toHaveBeenCalledWith('1', '#ffcdd2');
  });

  test('calls onComplete when complete button is clicked', () => {
    render(<StickyNote {...mockProps} />);
    
    const completeButton = screen.getByLabelText('Complete note');
    fireEvent.click(completeButton);
    
    expect(mockProps.onComplete).toHaveBeenCalledWith('1');
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<StickyNote {...mockProps} />);
    
    const deleteButton = screen.getByLabelText('Delete note');
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  test('displays timer for old notes', () => {
    // Create a note that's more than 24 hours old
    const oldNote = {
      ...mockNote,
      createdAt: Date.now() - 25 * 60 * 60 * 1000 // 25 hours ago
    };
    
    render(<StickyNote {...mockProps} note={oldNote} />);
    
    // The timer should be displayed
    expect(screen.getByText(/Created/i)).toBeInTheDocument();
  });

  test('applies completed styling when isCompleted is true', () => {
    render(<StickyNote {...mockProps} isCompleted={true} />);
    
    const textarea = screen.getByDisplayValue('Test note content');
    expect(textarea).toHaveStyle({ textDecoration: 'line-through' });
  });

  test('applies archived styling when isArchiving is true', () => {
    render(<StickyNote {...mockProps} isArchiving={true} />);
    
    // The note container should have the explosion animation
    const noteContainer = screen.getByDisplayValue('Test note content').parentElement;
    expect(noteContainer).toHaveStyle({ animation: expect.stringContaining('explosionAnimation') });
  });

  test('auto-focuses the textarea when autoFocus is true', () => {
    render(<StickyNote {...mockProps} autoFocus={true} />);
    
    const textarea = screen.getByDisplayValue('Test note content');
    expect(document.activeElement).toBe(textarea);
  });

  test('updates timer display over time', () => {
    // Create a note that's 1 hour old
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const oldNote = {
      ...mockNote,
      createdAt: oneHourAgo
    };
    
    render(<StickyNote {...mockProps} note={oldNote} />);
    
    // Initially should show "Created 1 hour ago"
    expect(screen.getByText(/Created 1 hour ago/i)).toBeInTheDocument();
    
    // Advance time by 30 minutes
    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000);
    });
    
    // Now should show "Created 1 hour 30 minutes ago"
    expect(screen.getByText(/Created 1 hour 30 minutes ago/i)).toBeInTheDocument();
  });
}); 