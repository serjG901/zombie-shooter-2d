const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const shooterImage = document.getElementById("shooter");
const zombieImage = document.getElementById("zombie");
const bloodZombie = document.getElementById("bloodZombie");

//---------------------------------------------------------canvasRealWidth/canvasRealHeight
let canvasRealWidth = canvas.width;
let canvasRealHeight = canvas.heigth;
const resizeCanvasObserver = new ResizeObserver((entries) => {
    const canvasBoundingClientRect = entries[0].contentRect;
    canvasRealWidth = canvasBoundingClientRect.width;
    canvasRealHeight = canvasBoundingClientRect.height;
    console.log(canvasRealWidth, canvasRealHeight);
});
resizeCanvasObserver.observe(canvas);
document.addEventListener("beforeunload", () => {
    resizeCanvasObserver.unobserve(canvas);
});

//---------------------------------------------------------  mouseInCanvasX/mouseInCanvasY
let mouseInCanvasX = 0;
let mouseInCanvasY = 0;
document.addEventListener("mousemove", (e) => {
    const mouseX =
        ((e.clientX - canvas.offsetLeft) * canvas.width) / canvasRealWidth;
    const mouseY =
        ((e.clientY - canvas.offsetTop) * canvas.height) / canvasRealHeight;
    mouseInCanvasX =
        mouseX < 0 ? 0 : mouseX > canvas.width ? canvas.width : mouseX;
    mouseInCanvasY =
        mouseY < 0 ? 0 : mouseY > canvas.height ? canvas.height : mouseY;
});

//--------------------------------------------------------- support function
function getAngle(w, h, x, y) {
    if (x === w / 2 && y === h / 2) return 0;
    if (x === w / 2 && y < h / 2) return 0;
    if (x === w / 2 && y > h / 2) return Math.PI;
    if (x < w / 2 && y === h / 2) return Math.PI * 1.5;
    if (x > w / 2 && y === h / 2) return Math.PI * 0.5;
    if (x < w / 2 && y < h / 2)
        return Math.atan((h / 2 - y) / (w / 2 - x)) + Math.PI * 1.5;
    if (x > w / 2 && y < h / 2)
        return -Math.atan((h / 2 - y) / (x - w / 2)) + Math.PI * 0.5;
    if (x > w / 2 && y > h / 2)
        return Math.atan((y - h / 2) / (x - w / 2)) + Math.PI * 0.5;
    if (x < w / 2 && y > h / 2)
        return Math.PI * 1.5 - Math.atan((y - h / 2) / (w / 2 - x));
}

const filterByIdAtPlace = (arr, id) =>
    arr.splice(
        arr.findIndex((item) => item.id === id),
        1
    );

function ctxRotateByAngle(angle) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
}
//-------------------------------------------------------- draw functions

//------------------------------line
function drawLaserLine() {
    const angle = getAngle(
        canvas.width,
        canvas.height,
        mouseInCanvasX,
        mouseInCanvasY
    );
    ctxRotateByAngle(angle);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(canvas.width / 2, -canvas.height / 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,0,0,0.2)";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

//------------------------------body
function drawShooter() {
    const angle = getAngle(
        canvas.width,
        canvas.height,
        mouseInCanvasX,
        mouseInCanvasY
    );
    ctxRotateByAngle(angle);
    /*  
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - 12);
    ctx.lineTo(canvas.width / 2 - 8, canvas.height / 2 + 4);
    ctx.lineTo(canvas.width / 2 + 8, canvas.height / 2 + 4);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 - 12);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "red";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();
    */
    ctx.drawImage(
        shooterImage,
        canvas.width / 2 - 16,
        canvas.height / 2 - 24,
        (14 * canvasRealWidth) / 512,
        (20 * canvasRealHeight) / 512
    );

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

//------------------------------bullets

function getDrawPistolsBullet() {
    const speed = 4;
    let angle = getAngle(
        canvas.width,
        canvas.height,
        mouseInCanvasX,
        mouseInCanvasY
    );
    function drawPistolsBullet(step = 0) {
        ctxRotateByAngle(angle);

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - 24 - step * speed);
        ctx.lineTo(canvas.width / 2, canvas.height / 2 - 30 - step * speed);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "orange";
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.closePath();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return [drawPistolsBullet, speed, angle];
}

let bullets = [];
let idBullet = 0;

document.addEventListener("click", (e) => {
    let [darwPistolsBullet, speed, angle] = getDrawPistolsBullet();
    bullets.push({
        id: idBullet,
        steps: 0,
        speed,
        getPosition() {
            return 30 + this.steps * speed;
        },
        angle,
        draw() {
            if (this.steps * speed < canvas.height) {
                darwPistolsBullet(this.steps);
                this.steps++;
            } else {
                filterByIdAtPlace(bullets, this.id);
                this.steps = 0;
            }
        },
    });
    idBullet++;
});

function drawBullets() {
    if (bullets.length) bullets.forEach((bullet) => bullet.draw());
}

//-------------------------------------zombies

function getDrawSimpleZombie() {
    const angle = 2 * Math.PI * Math.random();
    const zombieWidth = 24;
    const zombieHeight = 12;
    const speed = 0.5;
    function drawSimpleZombie(steps = 0) {
        ctxRotateByAngle(angle);

        /*   //---body
           ctx.beginPath()
           ctx.rect(canvas.width / 2 - zombieWidth / 2, steps * speed, zombieWidth, zombieHeight);
           ctx.rect(canvas.width / 2 - zombieWidth / 2, steps * speed, zombieWidth / 4, zombieHeight * 2);
           ctx.rect(canvas.width / 2 + zombieWidth / 2 - zombieWidth / 4, steps * speed, zombieWidth / 4, zombieHeight * 2);
           ctx.fillStyle = 'green';
           ctx.fill();
           ctx.closePath();
           //---head
           ctx.beginPath()
           ctx.rect(canvas.width / 2 - zombieWidth / 6, steps * speed, zombieWidth / 3, zombieHeight * 2 / 3);
           ctx.fillStyle = 'black';
           ctx.fill();
           ctx.closePath();
   */
        ctx.drawImage(
            zombieImage,
            canvas.width / 2 - zombieWidth / 2 - 9,
            steps * speed - zombieHeight / 2 - 4,
            (24 * canvasRealWidth) / 512,
            (24 * canvasRealHeight) / 512
        );

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return [drawSimpleZombie, speed, angle, zombieWidth, zombieHeight];
}

let zombies = [];
let idZombie = 0;

function addSimpleZombie() {
    const [drawSimpleZombie, speed, angle, zombieWidth, zombieHeight] =
        getDrawSimpleZombie();
    zombies.push({
        id: idZombie,
        steps: 0,
        speed,
        zombieHeight,
        getPosition() {
            return canvas.height / 2 - this.steps * speed;
        },
        angle,
        getCorners() {
            const r = this.getPosition();
            const sector = zombieWidth / r;
            const leftCorner = angle - sector / 2;
            const rightCorner = angle + sector / 2;
            return [leftCorner, rightCorner];
        },
        draw() {
            if (speed * this.steps < canvas.height / 2 - 12) {
                drawSimpleZombie(this.steps);
                this.steps++;
            } else {
                filterByIdAtPlace(zombies, this.id);
                lifes--;
            }
        },
    });
    idZombie++;
}

function drawSimpleZombies() {
    if (zombies.length) zombies.forEach((zombie) => zombie.draw());
}

//-------------------------------------blood splash

function drawBloodSplash(angle, position) {
    ctxRotateByAngle(angle);

    ctx.drawImage(
        bloodZombie,
        canvas.width / 2 - 18,
        position,
        (24 * canvasRealWidth) / 512,
        (24 * canvasRealHeight) / 512
    );

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

//----------------------------------------------------------------------collision
function collision(bullets, zombies) {
    bullets.forEach((bullet) => {
        zombies.forEach((zombie) => {
            const [leftCorner, rightCorner] = zombie.getCorners();
            const bulletPosition = bullet.getPosition();
            const zombiePosition = zombie.getPosition();
            if (
                bullet.angle > leftCorner &&
                bullet.angle < rightCorner &&
                bulletPosition > zombiePosition &&
                bulletPosition < zombiePosition + zombie.zombieHeight
            ) {
                drawBloodSplash(
                    bullet.angle,
                    canvas.height / 2 - bulletPosition
                );
                filterByIdAtPlace(bullets, bullet.id);
                filterByIdAtPlace(zombies, zombie.id);
                score++;
            }
        });
    });
}

//--------------------------------score

function drawScore() {
    ctx.beginPath();
    ctx.font = "30px monospace";
    ctx.fillText(`score: ${score}`, canvas.width / 2 - 50, 40);
    ctx.closePath();
}

//-------------------lifes

function drawLifes() {
    ctx.beginPath();
    ctx.font = "30px monospace";
    ctx.fillText(`lifes: ${lifes}`, canvas.width / 2 - 50, canvas.height - 40);
    ctx.closePath();
}

//------------------------------------------------------user statistics
let score = 0;
let lifes = 10;

//----end game

function isEndGame() {
    if (lifes < 0) {
        alert("GAME OVER");
        zombies = [];
        score = 0;
        lifes = 10;
    }
}

//-----faster appearance

//------------------------------------------------------animate
let zero = performance.now();

const simpleZombieDuration = 3000;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLaserLine();
    drawShooter();
    drawBullets();
    drawSimpleZombies();
    const value = (performance.now() - zero) / simpleZombieDuration;
    if (value > 1) {
        addSimpleZombie();
        zero = performance.now();
    }
    collision(bullets, zombies);
    drawScore();
    drawLifes();
    isEndGame();
    requestAnimationFrame(animate);
}

animate();

document.addEventListener("rotarydetent", function (event) {
    alert("Rotation direction: " + event.detail.direction);
});
