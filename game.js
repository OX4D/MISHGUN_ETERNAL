const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 70,
    speed: 5,
    texture: new Image(),
};
player.texture.src = 'path_to_player_image.png'; // Замените 'path_to_player_image.png' на путь к изображению игрока

const bullets = [];
let enemies = [];
let score = 0;
let level = 1;

const enemyTextures = [
    'path_to_enemy_image_1.png',
    'path_to_enemy_image_2.png',
    'path_to_enemy_image_3.png',
    'path_to_enemy_image_4.png',
    'path_to_enemy_image_5.png',
    'path_to_enemy_image_6.png',
    'path_to_enemy_image_7.png',
];

// Добавлено: создаем элемент аудио и указываем путь к музыке
const backgroundMusic = new Audio('path_to_background_music.ogg'); // Замените 'path_to_background_music.mp3' на путь к вашему аудиофайлу
backgroundMusic.loop = true; // Зацикливаем музыку
backgroundMusic.volume = 0.5; // Устанавливаем громкость

function playBackgroundMusic() {
    backgroundMusic.play();
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Сбрасываем время воспроизведения
}

function createEnemy() {
    const randomTextureIndex = Math.floor(Math.random() * enemyTextures.length);
    const enemyTexture = new Image();
    enemyTexture.src = enemyTextures[randomTextureIndex];
    
    return {
        x: Math.random() * canvas.width,
        y: 0,
        size: 70,
        speed: 3 + level * 0.5,
        texture: enemyTexture,
    };
}

let shootingInterval;
let canShoot = true;

function handleShooting() {
    if (canShoot) {
        bullets.push({ x: player.x, y: player.y });
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, 100); // Ожидание 100 миллисекунд перед следующим выстрелом
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullets();

    if (Math.random() < 0.02 + level * 0.005) {
        enemies.push(createEnemy());
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;

        if (!checkCollision(player, enemy)) {
            drawEnemies();
        } else {
            stopBackgroundMusic(); // Добавлено: останавливаем музыку при завершении игры
            alert("ТЫ ПРОСРАЛ! Настрелял фрагов: " + score + " ЛВЛ: " + level);
            document.location.reload();
            return;
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 15;

        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkBulletCollision(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 1;
                break;
            }
        }
    }

    drawEnemies();

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Фраги: " + score, 10, 30);
    ctx.fillText("Твой лвл: " + level, 10, 60);

    if (score >= level * 100) {
        level++;
        enemies = [];
    }

    requestAnimationFrame(update);
}

function drawPlayer() {
    ctx.drawImage(player.texture, player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.texture, enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    });
}

function checkCollision(player, enemy) {
    const distance = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2);
    return distance < player.size / 2 + enemy.size / 2;
}

function checkBulletCollision(bullet, enemy) {
    const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
    return distance < 5 + enemy.size / 2;
}

// Добавлено: начинаем воспроизведение музыки при загрузке страницы
playBackgroundMusic();

document.addEventListener("mousemove", event => {
    player.x = event.clientX;
    player.y = event.clientY;
});

document.addEventListener("mousedown", () => {
    handleShooting();
    shootingInterval = setInterval(handleShooting, 100);
});

document.addEventListener("mouseup", () => {
    clearInterval(shootingInterval);
});

update();
