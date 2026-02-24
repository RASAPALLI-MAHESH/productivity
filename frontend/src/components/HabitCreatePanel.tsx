import { useState, FormEvent } from 'react';

interface HabitCreatePanelProps {
    onClose: () => void;
    onCreate: (habit: any) => Promise<void>;
}

export function HabitCreatePanel({ onClose, onCreate }: HabitCreatePanelProps) {
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
    const [goalType, setGoalType] = useState<'yesno' | 'duration' | 'count'>('yesno');
    const [goalValue, setGoalValue] = useState(0);
    const [category, setCategory] = useState<'health' | 'learning' | 'work' | 'personal'>('health');
    const [motivation, setMotivation] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onCreate({
            name,
            description: motivation, // Use motivation as description
            frequency,
            goalType,
            goalValue,
            category,
            motivation
        });
        onClose();
    };

    return (
        <div className="side-panel-overlay" onClick={onClose}>
            <div className="habit-create-panel" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>New Habit</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label className="input-label">What do you want to achieve?</label>
                        <input
                            className="input"
                            style={{ fontSize: '18px', padding: '12px 16px' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g., Morning Run"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Frequency</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['daily', 'weekly', 'custom'].map(f => (
                                <button
                                    key={f}
                                    type="button"
                                    className={`btn ${frequency === f ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFrequency(f as any)}
                                    style={{ flex: 1, textTransform: 'capitalize' }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Goal Type</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { id: 'yesno', label: 'Yes/No', icon: 'check' },
                                { id: 'duration', label: 'Duration', icon: 'timer' },
                                { id: 'count', label: 'Count', icon: 'numbers' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={`btn ${goalType === t.id ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setGoalType(t.id as any)}
                                    style={{ flex: 1, gap: '4px', fontSize: '12px' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {goalType !== 'yesno' && (
                        <div className="input-group">
                            <label className="input-label">Daily Goal ({goalType === 'duration' ? 'minutes' : 'times'})</label>
                            <input
                                type="number"
                                className="input"
                                value={goalValue}
                                onChange={(e) => setGoalValue(Number(e.target.value))}
                                min="1"
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            style={{ background: 'var(--bg-input)' }}
                        >
                            <option value="health">Health</option>
                            <option value="learning">Learning</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Motivation (optional)</label>
                        <textarea
                            className="input"
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            placeholder="Why are you doing this?"
                            rows={2}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Create Habit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
