import React, { useState } from 'react';
import { MessageSquare, Plus, User, Clock, Loader2, AlignLeft, List, Link, Image, MoreVertical } from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

export const InvestigationNotes = ({ workId, notes = [], onNoteAdded }) => {
  const { activeWorkspaceId } = useApp();
  const [noteText, setNoteText] = useState('');
  const [officerName, setOfficerName] = useState('State Nodal Officer (Punjab)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || isSubmitting || !activeWorkspaceId || !workId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await api.postNote(activeWorkspaceId, workId, {
        note_text: noteText.trim(),
        officer_name: officerName.trim() || 'State Nodal Officer (Punjab)'
      });
      setNoteText('');
      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (err) {
      console.error('Failed to post investigation note:', err);
      setError(err.message || 'Failed to submit note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{ 
        padding: '20px 22px', 
        background: 'var(--color-surface-card)', 
        border: '1px solid var(--color-border-subtle)', 
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Header */}
      <div className="flex-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} color="var(--color-accent-teal)" />
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Investigation Notes &amp; Field Observations
          </span>
        </div>
        <span 
          style={{ 
            fontSize: '10px', 
            fontWeight: 700, 
            padding: '2px 8px', 
            borderRadius: '9999px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)'
          }}
        >
          {notes.length} Recorded Notes
        </span>
      </div>

      {/* Historical Notes Feed (if any) */}
      {notes && notes.length > 0 && (
        <div className="flex-col gap-2" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
          {notes.map((note) => (
            <div 
              key={note.id} 
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div className="flex-between items-center" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-1.5" style={{ color: 'var(--color-accent-teal)', fontWeight: 600 }}>
                  <User size={12} />
                  <span>{note.officer_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>{new Date(note.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.4 }}>
                {note.note_text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Rich Editor Box */}
      <form onSubmit={handleSubmitNote} className="flex-col gap-3">
        <div 
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          {/* Toolbar */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '8px 12px', 
              borderBottom: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
              fontSize: '12px'
            }}
          >
            <span style={{ fontWeight: 800, cursor: 'pointer', color: 'var(--color-text-secondary)' }}>B</span>
            <span style={{ fontStyle: 'italic', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>I</span>
            <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>U</span>
            <span style={{ height: '14px', width: '1px', background: 'var(--color-border-subtle)', margin: '0 2px' }} />
            <AlignLeft size={13} style={{ cursor: 'pointer' }} />
            <List size={13} style={{ cursor: 'pointer' }} />
            <span style={{ height: '14px', width: '1px', background: 'var(--color-border-subtle)', margin: '0 2px' }} />
            <Link size={13} style={{ cursor: 'pointer' }} />
            <Image size={13} style={{ cursor: 'pointer' }} />
            <MoreVertical size={13} style={{ cursor: 'pointer', marginLeft: 'auto' }} />
          </div>

          {/* Textarea */}
          <textarea
            rows={3}
            placeholder="Record official observation or note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '12px 14px',
              color: 'var(--color-text-primary)',
              fontSize: '12.5px',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {error && (
          <span style={{ color: 'var(--color-critical-text)', fontSize: '11px' }}>{error}</span>
        )}

        {/* Footer Actions */}
        <div className="flex-between items-center gap-3">
          <select
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            disabled={isSubmitting}
            style={{
              flex: 1,
              height: '36px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
              padding: '0 10px',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            <option value="State Nodal Officer (Punjab)">State Nodal Officer (Punjab)</option>
            <option value="District Authority (Ludhiana)">District Authority (Ludhiana)</option>
            <option value="CAG Field Auditor">CAG Field Auditor</option>
            <option value="MoSPI Monitoring Cell">MoSPI Monitoring Cell</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting || !noteText.trim()}
            className="btn-cyan-cta flex items-center gap-1.5"
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              opacity: (!noteText.trim() || isSubmitting) ? 0.6 : 1,
              cursor: (!noteText.trim() || isSubmitting) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={14} strokeWidth={3} />
            )}
            <span>Add Note</span>
          </button>
        </div>
      </form>
    </div>
  );
};
