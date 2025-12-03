// 미니게임 데이터 및 로직

// 단어 맞추기 데이터
const wordScrambleData = [
    { word: "십자가", hint: "예수님이 우리를 위해 달리신 곳", scrambled: "자십가" },
    { word: "크리스찬", hint: "천로역정의 주인공", scrambled: "리스찬크" },
    { word: "천성", hint: "우리의 최종 목적지", scrambled: "성천" },
    { word: "믿음", hint: "구원을 얻는 방법", scrambled: "음믿" },
    { word: "순례자", hint: "하늘 나라를 향해 가는 사람", scrambled: "자례순" },
    { word: "은혜", hint: "하나님이 거저 주시는 선물", scrambled: "혜은" }
];

// 기억력 게임 카드 데이터 (보드게임 스타일)
const memoryCards = [
    { id: 1, text: '십자가', color: '#E74C3C' },
    { id: 1, text: '십자가', color: '#E74C3C' },
    { id: 2, text: '성경', color: '#3498DB' },
    { id: 2, text: '성경', color: '#3498DB' },
    { id: 3, text: '크리스찬', color: '#27AE60' },
    { id: 3, text: '크리스찬', color: '#27AE60' },
    { id: 4, text: '천성', color: '#F39C12' },
    { id: 4, text: '천성', color: '#F39C12' },
    { id: 5, text: '좁은문', color: '#9B59B6' },
    { id: 5, text: '좁은문', color: '#9B59B6' },
    { id: 6, text: '믿음', color: '#E67E22' },
    { id: 6, text: '믿음', color: '#E67E22' }
];

// 타임어택 퀴즈 데이터
const timeAttackQuizzes = [
    { question: "크리스찬은 천성을 향해 여정을 떠났다", answer: true },
    { question: "천로역정은 과학 소설이다", answer: false },
    { question: "십자가 언덕에서 크리스찬의 짐이 떨어졌다", answer: true },
    { question: "크리스찬은 넓은 길로 갔다", answer: false },
    { question: "믿음은 우리를 구원한다", answer: true },
    { question: "완고는 크리스찬과 함께 끝까지 갔다", answer: false },
    { question: "복음전도자는 크리스찬을 도왔다", answer: true },
    { question: "천성은 이 땅에 있다", answer: false }
];

// 미니게임 상태
let currentWord = null;
let wordTimer = null;
let memoryState = {
    flippedCards: [],
    matchedPairs: 0,
    attempts: 0,
    cards: []
};
let timeAttackState = {
    currentIndex: 0,
    correctCount: 0,
    timer: null,
    timeLeft: 30,
    questions: []
};

// 단어 맞추기 시작
function initWordScramble() {
    // 랜덤 단어 선택
    currentWord = wordScrambleData[Math.floor(Math.random() * wordScrambleData.length)];

    document.getElementById('scramble-hint').textContent = currentWord.hint;
    document.getElementById('scrambled-word').textContent = currentWord.scrambled;
    document.getElementById('word-input').value = '';
    document.getElementById('word-result').innerHTML = '';

    // 타이머 시작
    let timeLeft = 30;
    document.getElementById('word-timer').textContent = timeLeft;

    wordTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('word-timer').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(wordTimer);
            endWordScramble(false);
        }
    }, 1000);

    // Enter 키로도 제출 가능
    document.getElementById('word-input').onkeypress = (e) => {
        if (e.key === 'Enter') checkWordAnswer();
    };
}

function checkWordAnswer() {
    if (!currentWord) return;

    const userAnswer = document.getElementById('word-input').value.trim();
    const isCorrect = userAnswer === currentWord.word;

    clearInterval(wordTimer);
    endWordScramble(isCorrect);
}

function endWordScramble(isCorrect) {
    const resultDiv = document.getElementById('word-result');

    if (isCorrect) {
        gameState.score += 20;
        resultDiv.innerHTML = `
      <div class="minigame-success">
        <h3>🎉 정답입니다!</h3>
        <p>정답: <strong>${currentWord.word}</strong></p>
        <p class="bonus-points">+20점 획득!</p>
        <button class="btn-primary" onclick="completeMiniGame()">완료</button>
      </div>
    `;
    } else {
        resultDiv.innerHTML = `
      <div class="minigame-failure">
        <h3>😢 아쉽습니다!</h3>
        <p>정답: <strong>${currentWord.word}</strong></p>
        <button class="btn-primary" onclick="completeMiniGame()">완료</button>
      </div>
    `;
    }
}

// 기억력 게임 시작
function initMemoryMatch() {
    // 카드 섞기
    memoryState.cards = [...memoryCards].sort(() => Math.random() - 0.5);
    memoryState.flippedCards = [];
    memoryState.matchedPairs = 0;
    memoryState.attempts = 0;

    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    memoryState.cards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'memory-card';
        cardDiv.dataset.index = index;
        cardDiv.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back" style="background-color: ${card.color}">
          <span class="card-text">${card.text}</span>
        </div>
      </div>
    `;
        cardDiv.onclick = () => flipCard(index);
        grid.appendChild(cardDiv);
    });

    updateMemoryStats();
    document.getElementById('memory-result').innerHTML = '';
}

function flipCard(index) {
    if (memoryState.flippedCards.length >= 2) return;
    if (memoryState.flippedCards.includes(index)) return;

    const card = document.querySelector(`.memory-card[data-index="${index}"]`);
    card.classList.add('flipped');
    memoryState.flippedCards.push(index);

    if (memoryState.flippedCards.length === 2) {
        memoryState.attempts++;
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [index1, index2] = memoryState.flippedCards;
    const card1 = memoryState.cards[index1];
    const card2 = memoryState.cards[index2];

    if (card1.id === card2.id) {
        // 매치 성공
        memoryState.matchedPairs++;
        memoryState.flippedCards = [];

        if (memoryState.matchedPairs === 6) {
            // 게임 완료
            gameState.score += 30;
            document.getElementById('memory-result').innerHTML = `
        <div class="minigame-success">
          <h3>🎉 모든 짝을 찾았습니다!</h3>
          <p>시도 횟수: ${memoryState.attempts}회</p>
          <p class="bonus-points">+30점 획득!</p>
          <button class="btn-primary" onclick="completeMiniGame()">완료</button>
        </div>
      `;
        }
    } else {
        // 매치 실패
        const cards = memoryState.flippedCards.map(i =>
            document.querySelector(`.memory-card[data-index="${i}"]`)
        );
        cards.forEach(card => card.classList.remove('flipped'));
        memoryState.flippedCards = [];
    }

    updateMemoryStats();
}

function updateMemoryStats() {
    document.getElementById('memory-attempts').textContent = memoryState.attempts;
    document.getElementById('memory-matches').textContent = memoryState.matchedPairs;
}

// 타임어택 퀴즈 시작
function initTimeAttack() {
    // 랜덤 문제 5개 선택
    timeAttackState.questions = [...timeAttackQuizzes]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    timeAttackState.currentIndex = 0;
    timeAttackState.correctCount = 0;
    timeAttackState.timeLeft = 30;

    document.getElementById('attack-result').innerHTML = '';
    showNextAttackQuestion();
    startAttackTimer();
}

function showNextAttackQuestion() {
    if (timeAttackState.currentIndex >= timeAttackState.questions.length) {
        endTimeAttack();
        return;
    }

    const question = timeAttackState.questions[timeAttackState.currentIndex];
    document.getElementById('attack-question').textContent = question.question;
    document.getElementById('attack-correct').textContent = timeAttackState.correctCount;
}

function startAttackTimer() {
    document.getElementById('attack-timer').textContent = timeAttackState.timeLeft;

    timeAttackState.timer = setInterval(() => {
        timeAttackState.timeLeft--;
        document.getElementById('attack-timer').textContent = timeAttackState.timeLeft;

        if (timeAttackState.timeLeft <= 0) {
            clearInterval(timeAttackState.timer);
            endTimeAttack();
        }
    }, 1000);
}

function answerTimeAttack(userAnswer) {
    const question = timeAttackState.questions[timeAttackState.currentIndex];

    if (userAnswer === question.answer) {
        timeAttackState.correctCount++;
    }

    timeAttackState.currentIndex++;
    showNextAttackQuestion();
}

function endTimeAttack() {
    clearInterval(timeAttackState.timer);

    const bonusPoints = timeAttackState.correctCount * 10;
    gameState.score += bonusPoints;

    document.getElementById('attack-result').innerHTML = `
    <div class="minigame-success">
      <h3>게임 종료!</h3>
      <p>맞춘 문제: <strong>${timeAttackState.correctCount}/5</strong></p>
      <p class="bonus-points">+${bonusPoints}점 획득!</p>
      <button class="btn-primary" onclick="completeMiniGame()">완료</button>
    </div>
  `;

    // 버튼 비활성화
    document.querySelectorAll('.attack-btn').forEach(btn => btn.disabled = true);
}

// 미니게임 완료
// 미니게임 완료
function completeMiniGame() {
    // 완료 화면으로 (맵은 이미 게임 전에 보여줌)
    showCompleteScreen();
}
