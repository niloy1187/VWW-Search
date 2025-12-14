import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Zap, Loader2, Sparkles } from 'lucide-react';

interface WaitingGameProps {
  onClose: () => void;
  resultsCount: number;
  isSearching: boolean;
  statusMessage: string;
}

export const WaitingGame: React.FC<WaitingGameProps> = ({ onClose, resultsCount, isSearching, statusMessage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER' | 'SUCCESS'>('IDLE');

  // Game Constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -11;
  const SPEED_START = 5;
  const SPEED_MAX = 12;
  const ACCELERATION = 0.002;

  // Refs for Game Loop State (Mutable to avoid re-renders)
  const state = useRef({
    frames: 0,
    speed: SPEED_START,
    dino: { x: 50, y: 0, w: 30, h: 30, dy: 0, grounded: false, ducking: false },
    obstacles: [] as { x: number, y: number, w: number, h: number, type: 'cactus' | 'bird' }[],
    clouds: [] as { x: number, y: number, size: number, speed: number }[],
    particles: [] as { x: number, y: number, vx: number, vy: number, life: number, color: string }[],
    groundOffset: 0,
    score: 0,
    animationId: 0,
    lastTime: 0,
    width: 0,
    height: 0,
    groundY: 0
  });

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('vww-runner-highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Watch for Success (Results Found)
  useEffect(() => {
    if (resultsCount > 0 && gameState !== 'SUCCESS') {
      setGameState('SUCCESS');
      triggerSuccessConfetti();
      setTimeout(onClose, 2500);
    }
  }, [resultsCount]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on bg
    if (!ctx) return;

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Normalize state dimensions
      state.current.width = rect.width;
      state.current.height = rect.height;
      state.current.groundY = rect.height - 40;
      
      // Scale Context
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    // ---------------- Drawing Helpers ---------------- //
    
    const drawDino = (x: number, y: number, w: number, h: number, ducking: boolean) => {
        ctx.fillStyle = '#ccff00'; // VFM Lime
        // Body
        if (ducking) {
            ctx.fillRect(x, y + 10, w + 10, h - 10);
        } else {
            ctx.fillRect(x, y, w, h);
            // Eye
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 20, y + 4, 4, 4);
        }
    };

    const drawObstacle = (o: { x: number, y: number, w: number, h: number, type: string }) => {
        ctx.fillStyle = '#ff5a1f'; // VFM Orange
        if (o.type === 'cactus') {
             // Draw Spikes
             ctx.beginPath();
             ctx.moveTo(o.x + o.w/2, o.y);
             ctx.lineTo(o.x + o.w, o.y + o.h);
             ctx.lineTo(o.x, o.y + o.h);
             ctx.fill();
        } else {
            // Bird
            ctx.fillStyle = '#8b5cf6'; // VFM Purple
            ctx.fillRect(o.x, o.y, o.w, o.h);
            // Wing flap (simple animation)
            if (Math.floor(state.current.frames / 10) % 2 === 0) {
                ctx.fillRect(o.x + 5, o.y - 10, 10, 10);
            } else {
                ctx.fillRect(o.x + 5, o.y + 5, 10, 10);
            }
        }
    };

    const spawnParticles = (x: number, y: number, color: string, count: number) => {
        for(let i=0; i<count; i++) {
            state.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color
            });
        }
    };

    // ---------------- Core Update Loop ---------------- //
    
    const loop = (time: number) => {
        const dt = Math.min((time - state.current.lastTime) / 16.67, 2); // Cap delta time
        state.current.lastTime = time;
        state.current.frames++;

        // Clear Screen
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, state.current.width, state.current.height);

        // --- UPDATE LOGIC --- //
        if (gameState === 'PLAYING') {
            const s = state.current;
            s.speed = Math.min(s.speed + ACCELERATION, SPEED_MAX);
            s.score += (s.speed / 10) * dt;
            setScore(Math.floor(s.score));

            // Ground Scrolling
            s.groundOffset = (s.groundOffset + s.speed * dt) % 20;

            // Dino Physics
            if (!s.dino.grounded) {
                s.dino.dy += GRAVITY * dt;
            }
            s.dino.y += s.dino.dy * dt;

            // Ground Collision
            if (s.dino.y + s.dino.h >= s.groundY) {
                s.dino.y = s.groundY - s.dino.h;
                s.dino.dy = 0;
                s.dino.grounded = true;
            } else {
                s.dino.grounded = false;
            }

            // Spawn Obstacles
            if (s.frames % Math.floor(1000 / s.speed) === 0) {
                if (Math.random() > 0.5) {
                    // Cactus
                    s.obstacles.push({ x: s.width, y: s.groundY - 30, w: 20, h: 30, type: 'cactus' });
                } else {
                    // Bird
                    const height = Math.random() > 0.7 ? 50 : 20;
                    s.obstacles.push({ x: s.width, y: s.groundY - height - 20, w: 30, h: 20, type: 'bird' });
                }
            }
            
            // Spawn Clouds
            if (s.frames % 200 === 0) {
                 s.clouds.push({ x: s.width, y: Math.random() * (s.height/2), size: 20 + Math.random() * 40, speed: 0.5 + Math.random() });
            }
        }

        // --- DRAWING --- //
        
        // Clouds
        ctx.fillStyle = '#ffffff10';
        for (let i = state.current.clouds.length - 1; i >= 0; i--) {
            const c = state.current.clouds[i];
            if (gameState === 'PLAYING') c.x -= c.speed;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
            ctx.fill();
            if (c.x + c.size < 0) state.current.clouds.splice(i, 1);
        }

        // Ground Line
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, state.current.groundY);
        ctx.lineTo(state.current.width, state.current.groundY);
        ctx.stroke();
        
        // Ground Detail dots (parallax)
        ctx.fillStyle = '#444';
        for (let i = 0; i < state.current.width; i += 20) {
            if ((i - Math.floor(state.current.groundOffset)) % 40 === 0) {
                ctx.fillRect(i - (state.current.groundOffset % 20), state.current.groundY + 5, 4, 4);
            }
        }

        // Obstacles
        for (let i = state.current.obstacles.length - 1; i >= 0; i--) {
            const o = state.current.obstacles[i];
            if (gameState === 'PLAYING') o.x -= state.current.speed * dt;
            drawObstacle(o);

            // Collision
            if (gameState === 'PLAYING' &&
                state.current.dino.x < o.x + o.w - 5 &&
                state.current.dino.x + state.current.dino.w - 5 > o.x &&
                state.current.dino.y < o.y + o.h - 5 &&
                state.current.dino.y + state.current.dino.h - 5 > o.y
            ) {
                // Game Over
                setGameState('GAME_OVER');
                spawnParticles(state.current.dino.x, state.current.dino.y, '#ccff00', 20);
                if (Math.floor(state.current.score) > highScore) {
                    setHighScore(Math.floor(state.current.score));
                    localStorage.setItem('vww-runner-highscore', Math.floor(state.current.score).toString());
                }
            }

            if (o.x + o.w < 0) state.current.obstacles.splice(i, 1);
        }

        // Particles
        for (let i = state.current.particles.length - 1; i >= 0; i--) {
            const p = state.current.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 4, 4);
            ctx.globalAlpha = 1.0;
            if (p.life <= 0) state.current.particles.splice(i, 1);
        }

        // Dino
        if (gameState !== 'IDLE') {
             drawDino(state.current.dino.x, state.current.dino.y, state.current.dino.w, state.current.dino.h, state.current.dino.ducking);
        }

        state.current.animationId = requestAnimationFrame(loop);
    };

    state.current.animationId = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(state.current.animationId);
    };
  }, [gameState, highScore]);

  // Controls
  useEffect(() => {
      const handleJump = () => {
          if (gameState === 'IDLE' || gameState === 'GAME_OVER') {
              // Reset Game
              state.current.score = 0;
              setScore(0);
              state.current.obstacles = [];
              state.current.particles = [];
              state.current.dino.y = state.current.groundY - state.current.dino.h;
              state.current.dino.dy = 0;
              state.current.speed = SPEED_START;
              setGameState('PLAYING');
          } else if (gameState === 'PLAYING' && state.current.dino.grounded) {
              state.current.dino.dy = JUMP_FORCE;
              state.current.dino.grounded = false;
          }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space' || e.code === 'ArrowUp') {
              e.preventDefault();
              handleJump();
          }
          if (e.code === 'ArrowDown') state.current.dino.ducking = true;
      };
      
      const handleKeyUp = (e: KeyboardEvent) => {
          if (e.code === 'ArrowDown') state.current.dino.ducking = false;
      };

      const handleTouchStart = (e: TouchEvent) => {
          e.preventDefault(); // Prevent scrolling
          handleJump();
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      const el = containerRef.current;
      if (el) {
          el.addEventListener('touchstart', handleTouchStart, { passive: false });
      }

      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          if (el) el.removeEventListener('touchstart', handleTouchStart);
      };
  }, [gameState]);

  const triggerSuccessConfetti = () => {
      // Just a helper to spawn particles in the game loop context if needed, 
      // but simpler to do via the useEffect reacting to 'SUCCESS' state above.
  };

  return (
    <div ref={containerRef} className="absolute inset-0 z-40 bg-[#121212] overflow-hidden rounded-3xl border border-white/10 shadow-2xl flex flex-col touch-none select-none">
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-500 bg-black/50 px-2 py-1 rounded-lg">
            <Trophy className="w-4 h-4 text-yellow-500" /> HI {highScore.toString().padStart(5, '0')}
          </div>
          <div className="text-3xl font-mono font-bold text-white tracking-widest drop-shadow-md">{score.toString().padStart(5, '0')}</div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {gameState === 'IDLE' && (
          <div className="text-center pointer-events-auto bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 animate-fade-in shadow-xl">
            <div className="w-12 h-12 bg-vfm-lime/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                <Zap className="w-6 h-6 text-vfm-lime" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 font-display">VFM RUNNER</h1>
            <p className="text-xs text-zinc-400 font-mono">TAP OR SPACE TO START</p>
          </div>
        )}
        {gameState === 'GAME_OVER' && (
          <div className="text-center pointer-events-auto bg-black/80 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/10 shadow-2xl animate-pop">
            <h2 className="text-2xl font-bold text-zinc-300 mb-1 font-display tracking-widest">CRASHED</h2>
            <div className="text-vfm-lime font-mono text-xl mb-4">SCORE: {Math.floor(score)}</div>
            <button className="bg-white text-black font-bold px-6 py-3 rounded-xl uppercase tracking-wider hover:bg-vfm-lime transition-colors">Try Again</button>
          </div>
        )}
        {gameState === 'SUCCESS' && (
             <div className="text-center animate-pop bg-black/90 backdrop-blur-xl p-8 rounded-3xl border border-vfm-lime/50 shadow-[0_0_100px_rgba(204,255,0,0.2)]">
                <div className="flex flex-col items-center gap-3">
                    <Sparkles className="w-12 h-12 text-vfm-lime animate-spin-slow" />
                    <h2 className="text-4xl font-display font-bold text-white">FOUND IT!</h2>
                    <p className="text-vfm-lime font-mono text-sm tracking-widest">{resultsCount} DEALS UNLOCKED</p>
                </div>
            </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4 flex items-end justify-between z-20 h-24">
           <div className="flex items-center gap-3 bg-black/60 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
               <Loader2 className="w-3.5 h-3.5 text-vfm-lime animate-spin" />
               <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider animate-pulse">{statusMessage || "Scanning VFM Database..."}</span>
           </div>
           {gameState !== 'SUCCESS' && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] text-zinc-400 hover:text-white uppercase font-bold tracking-widest transition-all pointer-events-auto border border-white/5 hover:border-white/20">
                Skip Game
            </button>
           )}
      </div>

      <canvas ref={canvasRef} className="w-full h-full block image-pixelated" />
    </div>
  );
};