export function createTimer() { return { running:false, startedAt:null, elapsedMs:0 }; }
export function startTimer(timer, nowMs) { return timer.running ? timer : { ...timer, running:true, startedAt:nowMs }; }
export function stopTimer(timer, nowMs) { return timer.running ? { running:false, startedAt:null, elapsedMs:getElapsedMs(timer,nowMs) } : timer; }
export function resetTimer() { return createTimer(); }
export function getElapsedMs(timer, nowMs) { return timer.elapsedMs + (timer.running ? Math.max(0,nowMs-timer.startedAt) : 0); }
export function formatTime(ms) { const tenths=Math.floor(Math.max(0,ms)/100); const minutes=Math.floor(tenths/600); const seconds=Math.floor(tenths/10)%60; return `${minutes}:${String(seconds).padStart(2,'0')}.${tenths%10}`; }
