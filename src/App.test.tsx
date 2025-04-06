import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import Cookies from 'js-cookie';

// Mock the js-cookie library
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

// Mock the canvas-confetti library
jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock Cookies.get to return null (no saved notes)
    (Cookies.get as jest.Mock).mockReturnValue(null);
  });

  test('renders app title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Today's List/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders add note button', () => {
    render(<App />);
    const addButton = screen.getByText(/➕ Add Note/i);
    expect(addButton).toBeInTheDocument();
  });

  test('adds a new note when add button is clicked', () => {
    render(<App />);
    
    // Initial state should have no notes
    expect(screen.queryByPlaceholderText(/Write your note here/i)).not.toBeInTheDocument();
    
    // Click the add button
    const addButton = screen.getByText(/➕ Add Note/i);
    fireEvent.click(addButton);
    
    // Now there should be a note with the placeholder text
    expect(screen.getByPlaceholderText(/Write your note here/i)).toBeInTheDocument();
    
    // Cookies.set should have been called to save the new note
    expect(Cookies.set).toHaveBeenCalled();
  });

  test('loads saved notes from cookies on initial render', () => {
    // Mock saved notes in cookies
    const savedNotes = [
      {
        id: '1',
        content: 'Test note',
        createdAt: Date.now(),
        color: '#ffeb3b',
        completed: false,
        archived: false
      }
    ];
    (Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(savedNotes));
    
    render(<App />);
    
    // The saved note should be displayed
    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument();
  });

  test('deletes a note when delete button is clicked', () => {
    // Mock saved notes in cookies
    const savedNotes = [
      {
        id: '1',
        content: 'Test note',
        createdAt: Date.now(),
        color: '#ffeb3b',
        completed: false,
        archived: false
      }
    ];
    (Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(savedNotes));
    
    render(<App />);
    
    // The saved note should be displayed
    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument();
    
    // Find and click the delete button (using aria-label)
    const deleteButton = screen.getByLabelText('Delete note');
    fireEvent.click(deleteButton);
    
    // The note should be removed
    expect(screen.queryByDisplayValue('Test note')).not.toBeInTheDocument();
    
    // Cookies.set should have been called to update the saved notes
    expect(Cookies.set).toHaveBeenCalled();
  });

  test('completes a note when complete button is clicked', () => {
    // Mock saved notes in cookies
    const savedNotes = [
      {
        id: '1',
        content: 'Test note',
        createdAt: Date.now(),
        color: '#ffeb3b',
        completed: false,
        archived: false
      }
    ];
    (Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(savedNotes));
    
    render(<App />);
    
    // The saved note should be displayed
    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument();
    
    // Find and click the complete button (using aria-label)
    const completeButton = screen.getByLabelText('Complete note');
    fireEvent.click(completeButton);
    
    // The note should be marked as completed (has line-through style)
    const noteTextarea = screen.getByDisplayValue('Test note');
    expect(noteTextarea).toHaveStyle({ textDecoration: 'line-through' });
    
    // Cookies.set should have been called to update the saved notes
    expect(Cookies.set).toHaveBeenCalled();
  });

  test('finishes all notes when finish all button is clicked', () => {
    // Mock saved notes in cookies with multiple uncompleted notes
    const savedNotes = [
      {
        id: '1',
        content: 'Test note 1',
        createdAt: Date.now(),
        color: '#ffeb3b',
        completed: false,
        archived: false
      },
      {
        id: '2',
        content: 'Test note 2',
        createdAt: Date.now(),
        color: '#a5d6a7',
        completed: false,
        archived: false
      }
    ];
    (Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(savedNotes));
    
    render(<App />);
    
    // Both notes should be displayed
    expect(screen.getByDisplayValue('Test note 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test note 2')).toBeInTheDocument();
    
    // Find and click the finish all button
    const finishAllButton = screen.getByText(/✅ All done for the day!!!/i);
    fireEvent.click(finishAllButton);
    
    // Both notes should be marked as completed
    const note1Textarea = screen.getByDisplayValue('Test note 1');
    const note2Textarea = screen.getByDisplayValue('Test note 2');
    expect(note1Textarea).toHaveStyle({ textDecoration: 'line-through' });
    expect(note2Textarea).toHaveStyle({ textDecoration: 'line-through' });
    
    // Cookies.set should have been called to update the saved notes
    expect(Cookies.set).toHaveBeenCalled();
  });
});
