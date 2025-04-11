import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import confetti from 'canvas-confetti';
import { Note } from '../types';

interface StickyNoteProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  onColorChange: (id: string, color: string) => void;
  onComplete?: (id: string) => void;
  onRestore?: (id: string) => void;
  isCompleted?: boolean;
  autoFocus?: boolean;
  isArchiving?: boolean;
  isNew?: boolean;
  isExploding?: boolean;
}

const flashAnimation = keyframes`
  0% { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
  50% { box-shadow: 0 0 15px 5px rgba(255, 0, 0, 0.5); }
  100% { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
`;

const flourishAnimation = keyframes`
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 0.8; }
  100% { transform: scale(0) rotate(10deg); opacity: 0; }
`;

const explosionAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  20% { transform: scale(0.9); opacity: 0.9; }
  40% { transform: scale(0.8); opacity: 0.8; }
  60% { transform: scale(0.7); opacity: 0.6; }
  80% { transform: scale(0.6); opacity: 0.3; }
  100% { transform: scale(0); opacity: 0; }
`;

const emojiFloatAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(20deg); opacity: 0; }
`;

const NoteContainer = styled.div<{ color: string; isNew: boolean; isExploding: boolean; isCompleted: boolean; isCompleting: boolean }>`
  background-color: ${props => props.color};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 10px;
  width: ${props => props.isCompleted ? '100%' : '250px'};
  min-height: 200px;
  position: relative;
  transition: all 0.3s ease;
  animation: ${props => {
    if (props.isExploding) return explosionAnimation;
    if (props.isCompleting) return flourishAnimation;
    if (props.isNew) return flashAnimation;
    return 'none';
  }} ${props => {
    if (props.isExploding) return '0.5s ease-in-out forwards';
    if (props.isCompleting) return '0.8s ease-in-out forwards';
    return '1s ease-in-out';
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const NoteContent = styled.textarea<{ isCompleted: boolean }>`
  background: transparent;
  border: none;
  resize: none;
  flex-grow: 1;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 20px;
  line-height: 1.6;
  color: ${props => props.isCompleted ? '#999' : '#333'};
  padding: 12px;
  text-decoration: ${props => props.isCompleted ? 'line-through' : 'none'};
  min-height: ${props => props.isCompleted ? '60px' : 'auto'};
  max-height: ${props => props.isCompleted ? '120px' : 'none'};
  overflow-y: ${props => props.isCompleted ? 'auto' : 'hidden'};
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: #999;
    font-style: italic;
    font-size: 18px;
  }
`;

const Timer = styled.div`
  font-size: 12px;
  color: #666;
  position: absolute;
  right: 10px;
  bottom: 10px;
`;

const ControlsContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const BottomControlsContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DoneButton = styled.button`
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  &:hover {
    background-color: rgba(76, 175, 80, 0.2);
    opacity: 1;
    transform: scale(1.05);
  }
`;

const ColorPickerButton = styled.button`
  background-color: rgba(0, 0, 0, 0.05);
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    opacity: 1;
    transform: scale(1.05);
  }
`;

const ColorPickerContainer = styled.div`
  position: absolute;
  top: 40px;
  right: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
`;

const ColorOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const ColorPickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const ColorPickerTitle = styled.span`
  font-size: 12px;
  color: #666;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const ColorOption = styled.button<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
  }
`;

const RestoreButton = styled.button`
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  &:hover {
    background-color: rgba(76, 175, 80, 0.2);
    opacity: 1;
    transform: scale(1.05);
  }
`;

const EmojiParticle = styled.div<{ left: number; delay: number }>`
  position: absolute;
  font-size: 24px;
  left: ${props => props.left}%;
  bottom: 0;
  animation: ${emojiFloatAnimation} 1s ease-out ${props => props.delay}s forwards;
  pointer-events: none;
  z-index: 100;
`;

const StickyNote: React.FC<StickyNoteProps> = ({ 
  note, 
  onDelete, 
  onUpdate, 
  onColorChange,
  onComplete,
  onRestore,
  isCompleted = false,
  autoFocus = false,
  isArchiving = false,
  isNew = false,
  isExploding = false
}) => {
  const [timeElapsed, setTimeElapsed] = useState<string>('');
  const [content, setContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isOld, setIsOld] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiParticles, setEmojiParticles] = useState<Array<{ id: number; emoji: string; left: number; delay: number }>>([]);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = now - note.createdAt;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      // Check if note is older than an hour
      setIsOld(hours > 0);

      if (days > 0) {
        setTimeElapsed(`${days}d ${hours % 24}h ago`);
      } else if (hours > 0) {
        setTimeElapsed(`${hours}h ${minutes % 60}m ago`);
      } else {
        setTimeElapsed(`${minutes}m ago`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [note.createdAt]);

  useEffect(() => {
    if ((isNew || autoFocus) && textareaRef.current && !isCompleted) {
      textareaRef.current.focus();
    }
  }, [isNew, autoFocus, isCompleted]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate(note.id, newContent);
  };

  const handleColorChange = (color: string) => {
    onColorChange(note.id, color);
    setShowColorPicker(false);
  };

  const handleComplete = () => {
    setIsCompleting(true);
    
    // Trigger confetti animation
    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ['#ffd700', '#ff9d00', '#ff4500', '#ff6347', '#ff7f50']
      });
    }
    
    // Call the onComplete callback after a short delay
    setTimeout(() => {
      onComplete && onComplete(note.id);
      setIsCompleting(false);
    }, 800);
  };

  const handleRestore = () => {
    if (noteRef.current && onRestore) {
      // Create emoji particles
      const sadEmojis = ['😢', '😭', '😞', '😔', '😟'];
      const particles = [];
      
      for (let i = 0; i < 15; i++) {
        particles.push({
          id: i,
          emoji: sadEmojis[Math.floor(Math.random() * sadEmojis.length)],
          left: Math.random() * 80 + 10, // 10% to 90% of container width
          delay: i * 0.05 // Stagger the animation
        });
      }
      
      setEmojiParticles(particles);
      setShowEmojis(true);
      
      // Call onRestore after animation completes
      setTimeout(() => {
        setShowEmojis(false);
        onRestore(note.id);
      }, 1500);
    }
  };

  const COLORS = [
    '#ffd700', // Gold
    '#98fb98', // Pale Green
    '#87ceeb', // Sky Blue
    '#dda0dd', // Plum
    '#f0e68c', // Khaki
    '#ffa07a', // Light Salmon
    '#b0e0e6', // Powder Blue
    '#ffb6c1', // Light Pink
    '#d8bfd8', // Thistle
    '#f0fff0', // Honeydew
  ];

  return (
    <NoteContainer 
      color={note.color}
      isNew={isNew}
      isExploding={isExploding}
      isCompleted={isCompleted}
      isCompleting={isCompleting}
      ref={noteRef}
    >
      {showEmojis && emojiParticles.map(particle => (
        <EmojiParticle key={particle.id} left={particle.left} delay={particle.delay}>
          {particle.emoji}
        </EmojiParticle>
      ))}
      
      <ControlsContainer>
        <IconButton onClick={() => onDelete(note.id)}>×</IconButton>
      </ControlsContainer>
      
      {showColorPicker && (
        <ColorPickerContainer>
          <ColorPickerHeader>
            <ColorPickerTitle>Choose color</ColorPickerTitle>
            <CloseButton onClick={() => setShowColorPicker(false)}>×</CloseButton>
          </ColorPickerHeader>
          <ColorOptionsContainer>
            {COLORS.map((color) => (
              <ColorOption 
                key={color} 
                color={color} 
                onClick={() => handleColorChange(color)}
              />
            ))}
          </ColorOptionsContainer>
        </ColorPickerContainer>
      )}
      
      <NoteContent 
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Write your note here..."
        isCompleted={isCompleted}
        readOnly={isCompleted}
      />
      <BottomControlsContainer>
        {!isCompleted && (
          <DoneButton onClick={handleComplete}>✓</DoneButton>
        )}
        {isCompleted && onRestore && (
          <RestoreButton onClick={handleRestore} title="Restore note">↺</RestoreButton>
        )}
        <ColorPickerButton onClick={() => setShowColorPicker(!showColorPicker)}>
          🎨
        </ColorPickerButton>
      </BottomControlsContainer>
      {!note.archived && !isCompleted && <Timer>{timeElapsed}</Timer>}
    </NoteContainer>
  );
};

export default StickyNote; 