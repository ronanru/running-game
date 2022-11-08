import { Component, createSignal, onCleanup } from 'solid-js';
import styles from './App.module.css';
import boxTexture from './textures/box.png';

interface Obstacle {
  lane: number;
  distance: number;
}

const App: Component = () => {
  const [scale, setScale] = createSignal(
      Math.min(window.innerHeight / 1920, window.innerWidth / 1080)
    ),
    [trackOffset, setTrackOffset] = createSignal(0),
    [currentLane, setCurrentLane] = createSignal(1),
    [isGameStarted, setIsGameStarted] = createSignal(false),
    [isGameOver, setIsGameOver] = createSignal(false),
    [obstacles, setObstacles] = createSignal<Obstacle[]>([]),
    [score, setScore] = createSignal(0),
    [jumpHeight, setJumpHeight] = createSignal(0),
    updateScale = () => setScale(Math.min(window.innerHeight / 1920, window.innerWidth / 1080)),
    gameLoop = () => {
      if (obstacles().some(({ lane, distance }) => distance < 0 && lane === currentLane())) {
        setIsGameOver(true);
        animationFrame = null;
        return;
      }
      setObstacles(o => [
        ...(Math.random() > 0.99 ? [{ distance: 500, lane: Math.floor(Math.random() * 3) }] : []),
        ...o
          .map(o => ({ ...o, distance: o.distance - speed }))
          .filter(({ distance }) => distance > -2)
      ]);
      setTrackOffset(t => (t + speed * 2.5) % 1080);
      setScore(s => s + speed);
      if (verticalAcceleration >= -15)
        setJumpHeight(height => Math.max(height + verticalAcceleration--, 0));
      animationFrame = requestAnimationFrame(gameLoop);
    },
    onKeyDown = (e: KeyboardEvent) => {
      if (isGameOver() || !isGameStarted()) return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          setCurrentLane(
            Math.min(Math.max(currentLane() + (e.key === 'ArrowRight' ? 1 : -1), 0), 2)
          );
          break;
        case ' ':
        case 'ArrowUp':
          if (jumpHeight() <= 0) verticalAcceleration = 15;
          break;
        default:
          console.log(`There are no handler for key "${e.key}"`);
      }
    },
    startGame = () => {
      setCurrentLane(1);
      setScore(0);
      setIsGameStarted(true);
      setIsGameOver(false);
      animationFrame = requestAnimationFrame(gameLoop);
    };

  let animationFrame: number | null = null,
    speed = 1,
    verticalAcceleration = 0;

  window.addEventListener('resize', updateScale);
  window.addEventListener('keydown', onKeyDown);

  onCleanup(() => {
    window.removeEventListener('resize', updateScale);
    window.removeEventListener('keydown', onKeyDown);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });

  return (
    <main
      class={styles.main}
      style={`transform: translate(-50%, -50%) scale(${scale()}); --lane: ${currentLane()};`}
    >
      <p class={styles.score}>
        Score: {Math.floor(score() / 10)} {jumpHeight()}
      </p>
      {!isGameStarted() && (
        <button class={styles.startBtn} onClick={startGame}>
          START GAME
        </button>
      )}
      {isGameOver() && (
        <div class={styles.gameOver}>
          <p>GAME OVER</p>
          <button onClick={startGame}>Restart</button>
        </div>
      )}
      {obstacles().map(({ distance, lane }) => (
        <img
          src={boxTexture}
          alt=""
          class={styles.obstacle}
          style={`--distance: ${distance}; --laneOffset: ${
            [
              [150, -600, -1360],
              [900, 140, -630],
              [1650, 890, 120]
            ][lane][currentLane()]
          }; --jumpOffset: ${jumpHeight()};`}
        ></img>
      ))}
      <div
        class={styles.track}
        style={`--offset: ${trackOffset()}; --jumpOffset: ${jumpHeight()};`}
      ></div>
    </main>
  );
};

export default App;
