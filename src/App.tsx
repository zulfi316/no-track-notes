import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import StickyNote from './components/StickyNote';
import { Note } from './types';
import confetti from 'canvas-confetti';

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
    padding: 15px 10px;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
    font-size: 2rem;
    margin-bottom: 15px;
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
    font-size: 2rem;
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
    width: 100%;
    justify-content: center;
  }
`;

const FinishAllButton = styled.button`
  background-color: #9c27b0; /* Changed to purple */
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
    background-color: #7b1fa2; /* Darker purple on hover */
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const NotesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 15px;
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
  justify-content: center;
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [lastCreatedNoteId, setLastCreatedNoteId] = useState<string | null>(null);
  const [explodingNotes, setExplodingNotes] = useState<string[]>([]);

  useEffect(() => {
    const savedNotes = Cookies.get('notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        // Ensure all notes have the new properties
        const updatedNotes = parsedNotes.map((note: Note) => ({
          ...note,
          completed: note.completed || false,
          archived: note.archived || false
        }));
        setNotes(updatedNotes);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      Cookies.set('notes', JSON.stringify(notes), { expires: 365 });
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
    
    // Update cookies with the filtered notes
    if (updatedNotes.length > 0) {
      Cookies.set('notes', JSON.stringify(updatedNotes), { expires: 365 });
    } else {
      // If no notes left, remove the cookie entirely
      Cookies.remove('notes');
    }
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
    setNotes(notes.map(note => 
      note.id === id ? { ...note, completed: true } : note
    ));
  };

  const archiveCompletedNotes = () => {
    // First, mark notes as exploding
    const completedNoteIds = notes
      .filter(note => note.completed && !note.archived)
      .map(note => note.id);
    
    setExplodingNotes(completedNoteIds);
    
    // Then, after animation completes, remove them completely instead of marking as archived
    setTimeout(() => {
      // Filter out completed notes that aren't already archived
      const updatedNotes = notes.filter(note => !(note.completed && !note.archived));
      
      // Update state
      setNotes(updatedNotes);
      
      // Update cookies with the filtered notes
      if (updatedNotes.length > 0) {
        Cookies.set('notes', JSON.stringify(updatedNotes), { expires: 365 });
      } else {
        // If no notes left, remove the cookie entirely
        Cookies.remove('notes');
      }
      
      setExplodingNotes([]);
    }, 500); // Match the animation duration
  };

  const finishAllNotes = () => {
    // Create a copy of the notes array to avoid state update issues
    const notesToComplete = notes.filter(note => !note.completed);
    
    // Mark all notes as completed
    setNotes(notes.map(note => 
      !note.completed ? { ...note, completed: true } : note
    ));
    
    // Trigger confetti for each note
    notesToComplete.forEach((note, index) => {
      setTimeout(() => {
        // Simulate the confetti effect for each note
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { 
            x: 0.5 + (Math.random() - 0.5) * 0.3, 
            y: 0.5 + (Math.random() - 0.5) * 0.3 
          },
          colors: ['#ffd700', '#ff9d00', '#ff4500', '#ff6347', '#ff7f50']
        });
      }, index * 200); // Stagger the confetti effects
    });
  };

  return (
    <AppContainer>
      <Header>
        <Title>
          <TitleIcon>📝</TitleIcon>
          <TitleText>Today's List</TitleText>
        </Title>
        <ButtonContainer>
          <AddButton onClick={addNote}>➕ Add Note</AddButton>
          <FinishAllButton onClick={finishAllNotes}>✅ All done for the day!!!</FinishAllButton>
        </ButtonContainer>
      </Header>
      
      <MainContent>
        <ActiveNotesSection>
          <NotesContainer>
            {notes
              .filter(note => !note.completed)
              .map(note => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onColorChange={updateNoteColor}
                  onComplete={completeNote}
                  autoFocus={note.id === lastCreatedNoteId}
                  isArchiving={explodingNotes.includes(note.id)}
                />
              ))}
          </NotesContainer>
        </ActiveNotesSection>
        
        {showCompleted && notes.some(note => note.completed && !note.archived) && (
          <CompletedNotesSection>
            <h2>Completed Notes</h2>
            <ArchiveButton onClick={archiveCompletedNotes}>
              🗑️ Archive Completed
            </ArchiveButton>
            <CompletedNotesList>
              {notes
                .filter(note => note.completed && !note.archived)
                .map(note => (
                  <StickyNote
                    key={note.id}
                    note={note}
                    onUpdate={updateNote}
                    onDelete={deleteNote}
                    onColorChange={updateNoteColor}
                    onComplete={completeNote}
                    isCompleted={true}
                    isArchiving={explodingNotes.includes(note.id)}
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
