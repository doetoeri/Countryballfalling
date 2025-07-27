// 이미지 파일 이름과 점수 설정 (images 폴더에 넣은 파일명과 일치시킬 것)
const countryballs = {
  korea:   { img: 'images/korea.png',   score: 0 },
  usa:     { img: 'images/usa.png',     score: 10 },
  japan:   { img: 'images/japan.png',   score: 8 },
  uk:      { img: 'images/uk.png',      score: 7 },
  poland:  { img: 'images/poland.png',  score: 3 },
  china:   { img: 'images/china.png',   score: -5 }
};

const countryKeys = Object.keys(countryballs);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerSize = 60;
let playerX = canvas.width/2 - playerSize/2;
let moveDir = 0;

let balls = [];
let score = 0;
let timeLeft = 30;
let playing = false;

// 이미지를 미리 로드
const loadedImages = {};
for(let key of countryKeys) {
  const img = new Image();
  img.src = countryballs[key].img;
  loadedImages[key] = img;
}

// 볼 생성 함수
function createBall() {
  const type = countryKeys[Math.floor(Math.random() * countryKeys.length)];
  const x = Math.random() * (canvas.width - playerSize);
  return {
    type,
    x,
    y: -60,
    size: 50 + Math.random()*15,
    speed: 2 + Math.random()*2 + (30-timeLeft)*0.08 // 점점 빨라짐
  };
}

// 볼 그리기
function drawCountryball(ball) {
  ctx.drawImage(loadedImages[ball.type], ball.x, ball.y, ball.size, ball.size);
}

// 플레이어 컨트리볼 그리기
function drawPlayerBall() {
  ctx.drawImage(loadedImages['korea'], playerX, canvas.height - playerSize - 8, playerSize, playerSize);
}

function update() {
  if (!playing) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 좌우 이동
  playerX += moveDir*6;
  if(playerX < 0) playerX = 0;
  if(playerX > canvas.width-playerSize) playerX = canvas.width-playerSize;

  // 볼 생성 확률 증가
  if(Math.random() < 0.02 + (30-timeLeft)*0.0015) {
    balls.push(createBall());
  }

  // 볼 갱신 및 충돌 확인
  for(let i=balls.length-1; i>=0; i--) {
    const ball = balls[i];
    ball.y += ball.speed;

    drawCountryball(ball);

    // 충돌 판정 (간단한 거리 비교)
    const px = playerX + playerSize/2;
    const py = canvas.height - playerSize/2 - 8;
    const bx = ball.x + ball.size/2;
    const by = ball.y + ball.size/2;
    const dist = Math.hypot(px-bx, py-by);

    if(dist < (playerSize+ball.size)*0.42) {
      score += countryballs[ball.type].score;
      balls.splice(i,1);
      continue;
    }

    // 화면 밖으로 나가면 삭제
    if(ball.y > canvas.height) balls.splice(i,1);
  }

  drawPlayerBall();

  // 점수, 시간 갱신
  document.getElementById('score').textContent = `점수: ${score}`;
  document.getElementById('timer').textContent = `남은 시간: ${timeLeft}`;

  requestAnimationFrame(update);
}

// 키/마우스 이벤트
document.addEventListener('keydown', e => {
  if(e.code==="ArrowLeft" || e.key==="a") moveDir = -1;
  if(e.code==="ArrowRight" || e.key==="d") moveDir = 1;
});
document.addEventListener('keyup', e => {
  if(e.code==="ArrowLeft"||e.key==="a"||e.code==="ArrowRight"||e.key==="d") moveDir=0;
});
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  playerX = e.clientX - rect.left - playerSize/2;
  if(playerX < 0) playerX = 0;
  if(playerX > canvas.width-playerSize) playerX = canvas.width-playerSize;
});

// 게임 시작, 타이머
document.getElementById('startBtn').onclick = function() {
  if(playing) return;
  balls = [];
  score = 0;
  timeLeft = 30;
  playing = true;
  playerX = canvas.width/2 - playerSize/2;
  this.disabled = true;
  update();
  const timer = setInterval(() => {
    if(!playing){
      clearInterval(timer);
      return;
    }
    timeLeft--;
    if(timeLeft<=0){
      playing = false;
      this.disabled = false;
      document.getElementById('timer').textContent = "게임 종료!";
    }
  }, 1000);
};

// 모바일 터치 대응(선택)
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  playerX = e.touches[0].clientX - rect.left - playerSize/2;
  if(playerX < 0) playerX = 0;
  if(playerX > canvas.width-playerSize) playerX = canvas.width-playerSize;
}, { passive: false });

