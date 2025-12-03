// 게임 상태 관리
let gameState = {
    currentCourseId: null,
    currentQuizIndex: 0,
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    completedCourses: []
};

// 로컬 스토리지에서 진행도 불러오기
function loadProgress() {
    const saved = localStorage.getItem('pilgrimProgressGame');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.completedCourses = data.completedCourses || [];
    }
    updateHomeProgress();
}

// 진행도 저장
function saveProgress() {
    localStorage.setItem('pilgrimProgressGame', JSON.stringify({
        completedCourses: gameState.completedCourses
    }));
}

// 진행도 초기화
function resetProgress() {
    if (confirm('정말 모든 진행도를 초기화하시겠습니까?')) {
        localStorage.removeItem('pilgrimProgressGame');
        gameState.completedCourses = [];
        updateHomeProgress();
        alert('진행도가 초기화되었습니다.');
    }
}

// 홈 화면 진행도 업데이트
function updateHomeProgress() {
    const completed = gameState.completedCourses.length;
    const total = coursesData.length;
    const percentage = (completed / total) * 100;

    const progressBar = document.getElementById('total-progress');
    const progressText = document.getElementById('progress-text');

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent = `${completed}개 코스 완료 / ${total}개 코스`;
    }
}

// 화면 전환
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // 화면별 초기화
    if (screenId === 'course-screen') {
        renderCourseList();
    } else if (screenId === 'home-screen') {
        updateHomeProgress();
    }
}

// 게임 시작
function startGame() {
    showScreen('course-screen');
}

// 코스 목록 렌더링
function renderCourseList() {
    const courseList = document.getElementById('course-list');
    courseList.innerHTML = '';

    coursesData.forEach((course, index) => {
        const isCompleted = gameState.completedCourses.includes(course.id);
        const isLocked = index > 0 && !gameState.completedCourses.includes(coursesData[index - 1].id);

        const courseCard = document.createElement('div');
        courseCard.className = `course-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;

        courseCard.innerHTML = `
      <div class="course-icon">${course.icon}</div>
      <div class="course-info">
        <h3 class="course-name">${course.name}</h3>
        <p class="course-description">${course.description}</p>
        <p class="course-meta">${course.quizzes.length}개의 퀴즈</p>
      </div>
      <div class="course-status">
        ${isCompleted ? '<span class="badge">✓ 완료</span>' : ''}
        ${isLocked ? '<span class="badge locked">🔒 잠김</span>' : ''}
      </div>
    `;

        if (!isLocked) {
            courseCard.style.cursor = 'pointer';
            courseCard.onclick = () => startCourse(course.id);
        }

        courseList.appendChild(courseCard);
    });
}

// 코스 시작
function startCourse(courseId) {
    gameState.currentCourseId = courseId;
    gameState.currentQuizIndex = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;

    const course = coursesData.find(c => c.id === courseId);
    gameState.totalQuestions = course.quizzes.length;

    showQuiz();
}

// 퀴즈 표시
function showQuiz() {
    const course = coursesData.find(c => c.id === gameState.currentCourseId);
    const quiz = course.quizzes[gameState.currentQuizIndex];

    document.getElementById('quiz-course-name').textContent = course.name;
    document.getElementById('quiz-number').textContent = `문제 ${gameState.currentQuizIndex + 1} / ${course.quizzes.length}`;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('quiz-question').textContent = quiz.question;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    quiz.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(button);
    });

    showScreen('quiz-screen');
}

// 정답 확인
function checkAnswer(selectedIndex) {
    const course = coursesData.find(c => c.id === gameState.currentCourseId);
    const quiz = course.quizzes[gameState.currentQuizIndex];
    const isCorrect = selectedIndex === quiz.correctAnswer;

    // 모든 버튼 비활성화
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === quiz.correctAnswer) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    if (isCorrect) {
        gameState.score += 10;
        gameState.correctAnswers++;
    }

    // 잠시 후 교훈 화면으로
    setTimeout(() => {
        showLesson(quiz.lesson, isCorrect);
    }, 1500);
}

// 교훈 표시
function showLesson(lesson, isCorrect) {
    document.getElementById('lesson-title').innerHTML = `
    ${isCorrect ? '✅ 정답입니다!' : '❌ 오답입니다'}<br>
    <span style="font-size: 0.7em; color: var(--primary);">📚 ${lesson.title}</span>
  `;
    document.getElementById('lesson-content').textContent = lesson.content;
    document.getElementById('lesson-verse').innerHTML = `
    <strong>📖 관련 성경 구절:</strong><br>
    ${lesson.verse}
  `;

    const course = coursesData.find(c => c.id === gameState.currentCourseId);
    const isLastQuiz = gameState.currentQuizIndex >= course.quizzes.length - 1;

    const nextBtn = document.getElementById('next-quiz-btn');
    if (isLastQuiz) {
        nextBtn.textContent = '코스 완료 확인';
        nextBtn.onclick = completeCourse;
    } else {
        nextBtn.textContent = '다음 문제';
        nextBtn.onclick = nextQuiz;
    }

    showScreen('lesson-screen');
}

// 다음 퀴즈
function nextQuiz() {
    gameState.currentQuizIndex++;
    showQuiz();
}

// 코스 완료
function completeCourse() {
    const course = coursesData.find(c => c.id === gameState.currentCourseId);

    // 완료 기록 저장
    if (!gameState.completedCourses.includes(course.id)) {
        gameState.completedCourses.push(course.id);
        saveProgress();
    }

    // 통계 계산 후 저장
    const accuracy = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
    gameState.lastCourseStats = {
        badgeIcon: course.badge.icon,
        badgeName: course.badge.name,
        courseName: course.name,
        score: gameState.score,
        accuracy: accuracy
    };

    // 여정 맵 표시
    showJourneyMap();
}

// 여정 맵 표시
function showJourneyMap() {
    renderJourneyMap();
    showScreen('map-screen');
}

// 여정 맵 렌더링
function renderJourneyMap() {
    const svgNS = "http://www.w3.org/2000/svg";
    const nodesGroup = document.getElementById('course-nodes');
    nodesGroup.innerHTML = '';

    // 코스 위치 좌표 (10개 코스)
    const nodePositions = [
        { x: 100, y: 500 }, // 1. 멸망의 도시
        { x: 250, y: 480 }, // 2. 좁은 문
        { x: 400, y: 500 }, // 3. 십자가 언덕
        { x: 550, y: 450 }, // 4. 고난의 산
        { x: 650, y: 350 }, // 5. 아름다운 궁전
        { x: 550, y: 250 }, // 6. 겸손/사망의 골짜기
        { x: 400, y: 200 }, // 7. 허영의 시장
        { x: 250, y: 150 }, // 8. 의심의 성
        { x: 400, y: 80 },  // 9. 기쁨의 산
        { x: 600, y: 50 }   // 10. 천성
    ];

    // 경로 그리기
    const path = document.getElementById('journey-path');
    if (path) {
        let d = `M ${nodePositions[0].x},${nodePositions[0].y}`;
        for (let i = 1; i < nodePositions.length; i++) {
            // 부드러운 곡선 (Cubic Bezier)
            const prev = nodePositions[i - 1];
            const curr = nodePositions[i];
            const midX = (prev.x + curr.x) / 2;
            d += ` C ${midX},${prev.y} ${midX},${curr.y} ${curr.x},${curr.y}`;
        }
        path.setAttribute('d', d);
    }

    coursesData.forEach((course, index) => {
        const pos = nodePositions[index] || { x: 100 + index * 100, y: 500 - index * 50 };
        const isCompleted = gameState.completedCourses.includes(course.id);
        const isCurrent = index === gameState.completedCourses.length;
        const isLocked = index > gameState.completedCourses.length;

        // 노드 그룹
        const nodeGroup = document.createElementNS(svgNS, 'g');
        nodeGroup.setAttribute('class', 'course-node');

        // 원형 배경
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', '30');
        circle.setAttribute('class', isCompleted ? 'node-completed' : isCurrent ? 'node-current' : 'node-locked');
        nodeGroup.appendChild(circle);

        // 아이콘
        const icon = document.createElementNS(svgNS, 'text');
        icon.setAttribute('x', pos.x);
        icon.setAttribute('y', pos.y + 8);
        icon.setAttribute('text-anchor', 'middle');
        icon.setAttribute('font-size', '24');
        icon.textContent = course.icon;
        nodeGroup.appendChild(icon);

        // 라벨
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', pos.x);
        label.setAttribute('y', pos.y + 50);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '14');
        label.setAttribute('fill', '#2C3E50');
        label.textContent = course.name;
        nodeGroup.appendChild(label);

        // 완료 체크마크
        if (isCompleted) {
            const check = document.createElementNS(svgNS, 'circle');
            check.setAttribute('cx', pos.x + 20);
            check.setAttribute('cy', pos.y - 20);
            check.setAttribute('r', '12');
            check.setAttribute('fill', '#27AE60');
            nodeGroup.appendChild(check);

            const checkMark = document.createElementNS(svgNS, 'text');
            checkMark.setAttribute('x', pos.x + 20);
            checkMark.setAttribute('y', pos.y - 15);
            checkMark.setAttribute('text-anchor', 'middle');
            checkMark.setAttribute('font-size', '14');
            checkMark.setAttribute('fill', 'white');
            checkMark.textContent = '✓';
            nodeGroup.appendChild(checkMark);
        }

        nodesGroup.appendChild(nodeGroup);
    });
}

// 맵 이후 진행 (자동 미니게임 실행)
function proceedAfterMap() {
    // 현재 완료한 코스의 인덱스 찾기
    const courseIndex = coursesData.findIndex(c => c.id === gameState.currentCourseId);

    // 코스 1~9 완료 시 미니게임 실행 (인덱스 0~8)
    // 코스 10 (인덱스 9) 완료 시에는 미니게임 없음 (최종 완료)
    if (courseIndex >= 0 && courseIndex < 9) {
        // 3가지 게임 순환: 단어 -> 기억력 -> 타임어택
        const gameTypeIndex = courseIndex % 3;
        let gameType;

        switch (gameTypeIndex) {
            case 0: gameType = 'word-scramble'; break; // 코스 1, 4, 7
            case 1: gameType = 'memory-match'; break;  // 코스 2, 5, 8
            case 2: gameType = 'time-attack'; break;   // 코스 3, 6, 9
        }

        startMiniGame(gameType);
    } else {
        // 마지막 코스거나 예외 상황이면 바로 완료 화면
        showCompleteScreen();
    }
}

// 미니게임 시작
function startMiniGame(gameType) {
    switch (gameType) {
        case 'word-scramble':
            showScreen('word-scramble-screen');
            initWordScramble();
            break;
        case 'memory-match':
            showScreen('memory-match-screen');
            initMemoryMatch();
            break;
        case 'time-attack':
            showScreen('time-attack-screen');
            initTimeAttack();
            break;
    }
}

// Google Apps Script URL (여기에 배포된 스크립트 URL을 입력하세요)
const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_SCRIPT_URL_HERE";

// 완료 화면 표시 (미니게임 이후)
function showCompleteScreen() {
    if (gameState.lastCourseStats) {
        document.getElementById('badge-icon').textContent = gameState.lastCourseStats.badgeIcon;
        document.getElementById('complete-message').innerHTML = `
      <strong>${gameState.lastCourseStats.badgeName}</strong> 배지를 획득했습니다!<br>
      "${gameState.lastCourseStats.courseName}" 코스를 완료했습니다.
    `;
        document.getElementById('final-score').textContent = gameState.score;
        document.getElementById('accuracy').textContent = `${gameState.lastCourseStats.accuracy}%`;
    }

    // 모든 코스(10개) 완료 시 제출 폼 표시
    if (gameState.completedCourses.length >= 10) {
        document.getElementById('final-submission').style.display = 'block';
    } else {
        document.getElementById('final-submission').style.display = 'none';
    }

    showScreen('complete-screen');
}

// 점수 제출
function submitScore() {
    const name = document.getElementById('player-name').value.trim();
    if (!name) {
        alert("이름을 입력해주세요!");
        return;
    }

    if (GOOGLE_SCRIPT_URL === "https://script.google.com/macros/s/AKfycbyMV6DwEMwoUUTxCInU3UIZbvCUibMnmlBYM8ggEHb5Z_8SJ5qtiJMDozbvInCHhPrjMw/exec") {
        alert("설정 오류: 구글 스크립트 URL이 설정되지 않았습니다. 가이드를 참고하여 URL을 설정해주세요.");
        return;
    }

    const data = {
        name: name,
        score: gameState.score,
        date: new Date().toLocaleString()
    };

    // 구글 스크립트로 데이터 전송
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(() => {
            alert(`축하합니다, ${name}님! 점수가 성공적으로 전송되었습니다.`);
            document.getElementById('final-submission').style.display = 'none';
        })
        .catch(err => {
            console.error('Error:', err);
            alert("전송 중 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.");
        });
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
});
