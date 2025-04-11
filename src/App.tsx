import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import StickyNote from './components/StickyNote';
import { Note } from './types';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  background-color: #f0f8ff; /* Light blue base */
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(255, 105, 180, 0.4) 3%, transparent 0%),
    radial-gradient(circle at 75px 75px, rgba(30, 144, 255, 0.4) 3%, transparent 0%),
    radial-gradient(circle at 125px 125px, rgba(147, 112, 219, 0.4) 3%, transparent 0%),
    radial-gradient(circle at 175px 175px, rgba(64, 224, 208, 0.4) 3%, transparent 0%),
    linear-gradient(to bottom, #e6f7ff, #d1e9ff);
  background-size: 100px 100px, 100px 100px, 100px 100px, 100px 100px, 100% 100%;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 5px 5px;
  }
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(230, 247, 255, 0.95), rgba(209, 233, 255, 0.95));
  backdrop-filter: blur(8px);
  padding: 20px;
  margin: -20px -20px 20px -20px;
  border-bottom: 1px solid rgba(30, 144, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25px 25px, rgba(255, 105, 180, 0.2) 3%, transparent 0%),
      radial-gradient(circle at 75px 75px, rgba(30, 144, 255, 0.2) 3%, transparent 0%),
      radial-gradient(circle at 125px 125px, rgba(147, 112, 219, 0.2) 3%, transparent 0%),
      radial-gradient(circle at 175px 175px, rgba(64, 224, 208, 0.2) 3%, transparent 0%);
    background-size: 100px 100px, 100px 100px, 100px 100px, 100px 100px;
    opacity: 0.5;
    z-index: -1;
  }
  
  @media (max-width: 768px) {
    padding: 2px;
    margin: -5px -5px 5px -5px;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    margin-bottom: 2px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 2px;
    gap: 10px;
  }
`;

const TitleText = styled.span`
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const TitleIcon = styled.span`
  font-size: 2.5rem;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.2));
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 250px;
    margin-bottom: 5px;
    gap: 5px;
  }
`;

const AddButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #45a049;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
    width: 100%;
    justify-content: center;
  }
`;

const FinishAllButton = styled.button`
  background-color: #9c27b0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #7b1fa2;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
    width: 100%;
    justify-content: center;
  }
`;

const NotesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 5px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ActiveNotesSection = styled.div`
  flex: 1;
`;

const CompletedNotesSection = styled.div`
  width: 300px;
  padding: 20px;
  background-color: rgba(240, 248, 255, 0.7); /* Light blue base with transparency */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(30, 144, 255, 0.3);
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(255, 105, 180, 0.2) 2%, transparent 0%),
    radial-gradient(circle at 75px 75px, rgba(30, 144, 255, 0.2) 2%, transparent 0%);
  background-size: 100px 100px, 100px 100px;
  
  @media (max-width: 768px) {
    width: 100%;
    max-height: none;
    padding: 15px;
  }
`;

const CompletedNotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ArchiveButton = styled.button`
  background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white */
  color: #616161; /* Darker gray for text */
  border: 1px solid rgba(173, 216, 230, 0.5);
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin: 0 auto 15px auto;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  backdrop-filter: blur(3px);
  transition: all 0.2s ease;
  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const COLORS = [
  '#ffd700', // Gold
  '#98fb98', // Pale Green
  '#87ceeb', // Sky Blue
  '#dda0dd', // Plum
  '#f0e68c', // Khaki
];

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [lastCreatedNoteId, setLastCreatedNoteId] = useState<string | null>(null);
  const [explodingNotes, setExplodingNotes] = useState<string[]>([]);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    } else {
      localStorage.removeItem('notes');
    }
  }, [notes]);

  const addNote = () => {
    const newNoteId = Date.now().toString();
    const newNote: Note = {
      id: newNoteId,
      content: '',
      createdAt: Date.now(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      completed: false,
      archived: false
    };
    setNotes([...notes, newNote]);
    setLastCreatedNoteId(newNoteId);
    
    // Reset the lastCreatedNoteId after a short delay
    setTimeout(() => {
      setLastCreatedNoteId(null);
    }, 100);
  };

  const deleteNote = (id: string) => {
    // Filter out the note with the given id
    const updatedNotes = notes.filter(note => note.id !== id);
    
    // Update state
    setNotes(updatedNotes);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, content } : note
    ));
  };

  const updateNoteColor = (id: string, color: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, color } : note
      )
    );
  };

  const completeNote = (id: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, completed: true } : note
      )
    );
  };

  const restoreNote = (id: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, completed: false } : note
      )
    );
  };

  const archiveCompletedNotes = () => {
    // Set exploding notes first
    const completedNoteIds = notes
      .filter(note => note.completed && !note.archived)
      .map(note => note.id);
    
    setExplodingNotes(completedNoteIds);
    
    // Wait for animation to complete before archiving
    setTimeout(() => {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.completed && !note.archived ? { ...note, archived: true } : note
        )
      );
      setExplodingNotes([]);
    }, 500);
  };

  const finishAllNotes = () => {
    // Get all active note IDs
    const activeNoteIds = notes
      .filter(note => !note.completed && !note.archived)
      .map(note => note.id);
    
    // Set exploding notes first
    setExplodingNotes(activeNoteIds);
    
    // Wait for animation to complete before completing all notes
    setTimeout(() => {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          !note.completed && !note.archived ? { ...note, completed: true } : note
        )
      );
      setExplodingNotes([]);
    }, 500);
  };

  return (
    <AppContainer>
      <StickyHeader>
        <Header>
          <Title>
            <TitleIcon>📝</TitleIcon>
            <TitleText>No Track Notes</TitleText>
          </Title>
          <ButtonContainer>
            <AddButton onClick={addNote}>
              <span>➕</span> Add Note
            </AddButton>
            <FinishAllButton onClick={finishAllNotes}>
              <span>✨</span> All Done for the Day
            </FinishAllButton>
          </ButtonContainer>
        </Header>
      </StickyHeader>
      <MainContent>
        <ActiveNotesSection>
          <NotesContainer>
            {notes
              .filter(note => !note.completed && !note.archived)
              .map(note => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onDelete={deleteNote}
                  onUpdate={updateNote}
                  onColorChange={updateNoteColor}
                  onComplete={completeNote}
                  isNew={note.id === lastCreatedNoteId}
                  isExploding={explodingNotes.includes(note.id)}
                  autoFocus={note.id === lastCreatedNoteId}
                />
              ))}
          </NotesContainer>
        </ActiveNotesSection>
        {notes.some(note => note.completed && !note.archived) && (
          <CompletedNotesSection>
            <ArchiveButton onClick={archiveCompletedNotes}>
              <span>🗑️</span> Archive Completed Notes
            </ArchiveButton>
            <CompletedNotesList>
              {notes
                .filter(note => note.completed && !note.archived)
                .map(note => (
                  <StickyNote
                    key={note.id}
                    note={note}
                    onDelete={deleteNote}
                    onUpdate={updateNote}
                    onColorChange={updateNoteColor}
                    onRestore={restoreNote}
                    isCompleted={true}
                    isExploding={explodingNotes.includes(note.id)}
                  />
                ))}
            </CompletedNotesList>
          </CompletedNotesSection>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
