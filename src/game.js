const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './img/background.jpg';

const birdImage = new Image();
birdImage.src = './img/plane.png';

const topPipeImage = new Image();
topPipeImage.src = './img/tallBuildingTop.png';

const bottomPipeImage = new Image();
bottomPipeImage.src = './img/tallBuildingBottom.png';

const bird = {
  radius: 25,
  velocity: 0,
  gravity: 0.6,
  jump: -9,
};

const pipeGap = 150;
const pipeWidth = 100;
let pipes = [];
let score = 0;
let frames = 0;

let gameActive = true;
let restarting = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (canvas.width < 500 && canvas.height < 700) {
    bird.x = canvas.width / 2;
    bird.y = canvas.height / 2;
  } else if (canvas.width < 800 && canvas.height < 1000) {
    bird.x = canvas.width / 1.5;
    bird.y = canvas.height / 2;
  } else {
    bird.x = canvas.width / 1.3;
    bird.y = canvas.height / 2;
  }

  if (!gameActive) {
    const maxWidth = canvas.width * 0.8;
    const text = 'Game Over. Press Space to Restart';
    ctx.font = '40px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';

    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const lineHeight = 40;
    const textX = canvas.width / 2;
    const textY = canvas.height / 2 - (lineHeight * lines.length) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], textX, textY + i * lineHeight);
    }
  }
}

resizeCanvas();

function enterFullscreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
}

// Listen for a specific key press ('F' for fullscreen)
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyF') {
    enterFullscreen();
  }
});

window.addEventListener('resize', resizeCanvas);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  ctx.drawImage(
    birdImage,
    bird.x - bird.radius,
    bird.y - bird.radius,
    bird.radius * 2,
    bird.radius * 2
  );

  // Generate initial pipe
  if (frames === 0) {
    const pipeY =
      Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
    pipes.push({ x: canvas.width, y: pipeY, passed: false });
  }

  // Generate pipes
  if (frames % 150 === 0 && frames !== 0) {
    const pipeY =
      Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
    pipes.push({ x: canvas.width, y: pipeY });
  }

  // Move pipes
  // Increase score when bird passes pipes
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];

    ctx.drawImage(
      topPipeImage,
      p.x,
      p.y - topPipeImage.height,
      pipeWidth,
      topPipeImage.height
    );

    ctx.drawImage(
      bottomPipeImage,
      p.x,
      p.y + pipeGap,
      pipeWidth,
      bottomPipeImage.height
    );

    p.x -= 2;

    // Check for collision between bird and pipes
    if (
      bird.x + bird.radius > p.x &&
      bird.x - bird.radius < p.x + pipeWidth &&
      (bird.y - bird.radius < p.y || bird.y + bird.radius > p.y + pipeGap)
    ) {
      return gameOver();
    }

    // Check if the bird passes between pipes
    if (bird.x > p.x && bird.x < p.x + pipeWidth && !p.passed) {
      score++;
      p.passed = true;
    }

    if (p.x + pipeWidth <= 0) {
      pipes.splice(i, 1);
      i--;
    }
  }

  if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
    return gameOver();
  }

  ctx.fillStyle = '#000';
  ctx.font = '24px Arial';

  const maxWidthForScore = canvas.width * 0.4;
  const scoreText = `Score: ${score}`;

  const scoreTextWidth = ctx.measureText(scoreText).width;

  const scoreX = Math.min(maxWidthForScore, canvas.width - scoreTextWidth - 10);

  ctx.fillText(scoreText, scoreX, 30);

  frames++;
  requestAnimationFrame(gameLoop);
}

function handleKeyPress(e) {
  if (e.code === 'Space') {
    if (gameActive) {
      bird.velocity = bird.jump;
    } else if (!restarting) {
      restarting = true;
      setTimeout(() => {
        restarting = false;
        resetGame();
        gameLoop();
      }, 500);
    }
  }
}

document.addEventListener('keydown', handleKeyPress);

function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frames = 0;
  gameActive = true;

  document.addEventListener('keydown', handleKeyPress);
}

function gameOver() {
  const maxWidth = canvas.width * 0.8;
  const victoryText = 'Game Over. Press Space to Restart';
  const scoreText = `Score: ${score}`;
  ctx.font = '40px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';

  function wrapText(text, x, y, maxWidth, lineHeight) {
    let words = text.split(' ');
    let line = '';
    let lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + i * lineHeight);
    }
  }

  const victoryX = canvas.width / 2;
  const victoryY = canvas.height / 2 - 40;
  const lineHeight = 50;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  wrapText(victoryText, victoryX, victoryY, maxWidth, lineHeight);

  const scoreX = canvas.width / 2;
  const scoreY = victoryY + lineHeight * 2;

  ctx.fillText(scoreText, scoreX, scoreY);

  gameActive = false;
}

gameLoop();
