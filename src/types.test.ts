import { Note } from './types';

describe('Note Type', () => {
  test('Note interface has all required properties', () => {
    // Create a sample note that satisfies the interface
    const note: Note = {
      id: '1',
      content: 'Test note',
      createdAt: Date.now(),
      color: '#ffeb3b',
      completed: false,
      archived: false
    };
    
    // Verify all properties exist
    expect(note).toHaveProperty('id');
    expect(note).toHaveProperty('content');
    expect(note).toHaveProperty('createdAt');
    expect(note).toHaveProperty('color');
    expect(note).toHaveProperty('completed');
    expect(note).toHaveProperty('archived');
    
    // Verify property types
    expect(typeof note.id).toBe('string');
    expect(typeof note.content).toBe('string');
    expect(typeof note.createdAt).toBe('number');
    expect(typeof note.color).toBe('string');
    expect(typeof note.completed).toBe('boolean');
    expect(typeof note.archived).toBe('boolean');
  });
}); 