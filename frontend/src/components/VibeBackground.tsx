import { useEffect, useState } from 'react';

export function VibeBackground() {
    const [stars, setStars] = useState<{ id: number; left: string; top: string; size: string; duration: string }[]>([]);

    useEffect(() => {
        // Generate random stars for the "drifting" effect
        const starCount = 50;
        const newStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${1 + Math.random() * 2}px`,
            duration: `${10 + Math.random() * 20}s`,
        }));
        setStars(newStars);
    }, []);

    return (
        <div className="bg-vibe">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        animationDuration: star.duration,
                    }}
                />
            ))}

            {/* Glowing Productivity Orbs */}
            <div className="orb" style={{
                width: '400px', height: '400px',
                background: 'rgba(99, 102, 241, 0.2)',
                top: '10%', left: '-5%'
            }} />
            <div className="orb" style={{
                width: '300px', height: '300px',
                background: 'rgba(192, 132, 252, 0.15)',
                bottom: '15%', right: '5%',
                animationDelay: '-4s'
            }} />
            <div className="orb" style={{
                width: '250px', height: '250px',
                background: 'rgba(129, 140, 248, 0.1)',
                top: '60%', left: '20%',
                animationDelay: '-2s'
            }} />
        </div>
    );
}
