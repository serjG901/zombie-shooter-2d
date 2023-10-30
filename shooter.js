const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const shooterImage = document.getElementById("shooter");
const zombieImage = document.getElementById("zombie");
const bloodZombie = document.getElementById("bloodZombie");
const shooterHearth = document.getElementById("shooterHearth");
const zombieHearth = document.getElementById("zombieHearth");

//---------------------------------------------------------canvasRealWidth/canvasRealHeight
let canvasRealWidth = canvas.width;
let canvasRealHeight = canvas.heigth;
const resizeCanvasObserver = new ResizeObserver((entries) => {
    const canvasBoundingClientRect = entries[0].contentRect;
    canvasRealWidth = canvasBoundingClientRect.width;
    canvasRealHeight = canvasBoundingClientRect.height;
});
resizeCanvasObserver.observe(canvas);
document.addEventListener("beforeunload", () => {
    resizeCanvasObserver.unobserve(canvas);
});

//---------------------------------------------------------  mouseInCanvasX/mouseInCanvasY
let mouseInCanvasX = 0;
let mouseInCanvasY = 0;
let lookAngle = 0;

function detectLookAngleMouse(e) {
    const mouseX =
        ((e.clientX - canvas.offsetLeft) * canvas.width) / canvasRealWidth;
    const mouseY =
        ((e.clientY - canvas.offsetTop) * canvas.height) / canvasRealHeight;
    mouseInCanvasX =
        mouseX < 0 ? 0 : mouseX > canvas.width ? canvas.width : mouseX;
    mouseInCanvasY =
        mouseY < 0 ? 0 : mouseY > canvas.height ? canvas.height : mouseY;
    lookAngle = getAngle(
        canvas.width,
        canvas.height,
        mouseInCanvasX,
        mouseInCanvasY
    );
}

function detectLookAngleTouch(e) {
    const touches = e.changedTouches;
    const touch = touches[0];
    if (touch) {
        const mouseX =
            ((touch.clientX - canvas.offsetLeft) * canvas.width) /
            canvasRealWidth;
        const mouseY =
            ((touch.clientY - canvas.offsetTop) * canvas.height) /
            canvasRealHeight;
        mouseInCanvasX =
            mouseX < 0 ? 0 : mouseX > canvas.width ? canvas.width : mouseX;
        mouseInCanvasY =
            mouseY < 0 ? 0 : mouseY > canvas.height ? canvas.height : mouseY;
        lookAngle = getAngle(
            canvas.width,
            canvas.height,
            mouseInCanvasX,
            mouseInCanvasY
        );
    }
}

document.addEventListener("mousemove", detectLookAngleMouse);
document.addEventListener("touchmove", detectLookAngleTouch);

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

//------------------------------laser
let laserStopPosition = -canvas.height / 2;

function drawLaser() {
    ctxRotateByAngle(lookAngle);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(canvas.width / 2, laserStopPosition);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,0,0,0.2)";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

//------------------------------shooter
const shooterWidth = 74;
const shooterHeight = 74;
function drawShooter() {
    ctxRotateByAngle(lookAngle);
    const shooterHearthWidth = 24;
    const shooterHearthHeight = 24;
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
        canvas.width / 2 - shooterWidth / 2,
        canvas.height / 2 - shooterHeight / 2,
        shooterWidth,
        shooterHeight
    );

    for (let i = 0; i < lifes; i++) {
        ctx.drawImage(
            shooterHearth,
            canvas.width / 2 - (lifes / 2 - i) * shooterHearthWidth,
            canvas.height / 2 + shooterHeight / 2 - shooterHearthHeight / 2,
            shooterHearthWidth,
            shooterHearthHeight
        );
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

//------------------------------bullets
const bulletStartPosition = shooterHeight / 2;
const bulletWidth = 4;
const bulletHeight = 6;
function getDrawPistolsBullet() {
    const bulletDamage = 1;
    const isRightThrough = false;
    const speed = 8;
    let angle = getAngle(
        canvas.width,
        canvas.height,
        mouseInCanvasX,
        mouseInCanvasY
    );

    function drawPistolsBullet(step = 0) {
        ctxRotateByAngle(angle);

        ctx.beginPath();
        ctx.moveTo(
            canvas.width / 2,
            canvas.height / 2 -
                bulletStartPosition -
                bulletHeight -
                step * speed
        );
        ctx.lineTo(
            canvas.width / 2,
            canvas.height / 2 - bulletStartPosition - step * speed
        );
        ctx.lineWidth = bulletWidth;
        ctx.strokeStyle = "orange";
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.closePath();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return [drawPistolsBullet, speed, angle, bulletDamage, isRightThrough];
}

let bullets = [];
let idBullet = 0;

function addBulletInBullets() {
    let [darwPistolsBullet, speed, angle, bulletDamage, isRightThrough] =
        getDrawPistolsBullet();
    bullets.push({
        id: idBullet,
        steps: 0,
        speed,
        bulletDamage,
        isRightThrough,
        getPosition() {
            return bulletStartPosition + this.steps * speed;
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
}

const pistolBullet = {
    func: addBulletInBullets,
    shotPerSecond: 10,
};

let timerAutoShoot = 0;
function autoShoot(bulletType) {
    timerAutoShoot = setInterval(
        bulletType.func,
        1000 / bulletType.shotPerSecond
    );
}
function stopAutoShoot() {
    clearInterval(timerAutoShoot);
}

//document.addEventListener("click", addBulletInBullets);

document.addEventListener("mousedown", (e) => autoShoot(pistolBullet));
document.addEventListener("mouseup", (e) => stopAutoShoot());

document.addEventListener("touchstart", (e) => {
    e.preventDefault();
    autoShoot(pistolBullet);
});
document.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopAutoShoot();
});

function drawBullets() {
    if (bullets.length) bullets.forEach((bullet) => bullet.draw());
}

//-------------------------------------zombies

function getDrawSimpleZombie() {
    const angle = 2 * Math.PI * Math.random();
    const zombieWidth = 56;
    const zombieHeight = 28;
    const speed = 0.5;
    const zombieLifes = 1;
    const zombieHearthWidth = 24;
    const zombieHearthHeight = 24;
    function drawSimpleZombie(steps = 0, zombieLifes) {
        ctxRotateByAngle(angle);
        /*
        //---body
        ctx.beginPath();
        ctx.rect(
            canvas.width / 2 - zombieWidth / 2,
            steps * speed - zombieHeight,
            zombieWidth,
            zombieHeight
        );
        ctx.rect(
            canvas.width / 2 - zombieWidth / 2,
            steps * speed - zombieHeight,
            zombieWidth / 4,
            zombieHeight * 2
        );
        ctx.rect(
            canvas.width / 2 + zombieWidth / 2 - zombieWidth / 4,
            steps * speed - zombieHeight,
            zombieWidth / 4,
            zombieHeight * 2
        );
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
        //---head
        ctx.beginPath();
        ctx.rect(
            canvas.width / 2 - zombieWidth / 6,
            steps * speed - zombieHeight,
            zombieWidth / 3,
            (zombieHeight * 2) / 3
        );
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
*/
        ctx.drawImage(
            zombieImage,
            canvas.width / 2 - zombieWidth / 2,
            steps * speed - zombieHeight,
            zombieWidth,
            zombieHeight * 2
        );
        for (let i = 0; i < zombieLifes; i++) {
            ctx.drawImage(
                zombieHearth,
                canvas.width / 2 - (zombieLifes / 2 - i) * zombieHearthWidth,
                steps * speed - zombieHeight - zombieHearthHeight,
                zombieHearthWidth,
                zombieHearthHeight
            );
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return [
        drawSimpleZombie,
        speed,
        angle,
        zombieWidth,
        zombieHeight,
        zombieLifes,
    ];
}

let zombies = [];
let idZombie = 0;

function addSimpleZombie() {
    const [
        drawSimpleZombie,
        speed,
        angle,
        zombieWidth,
        zombieHeight,
        zombieLifes,
    ] = getDrawSimpleZombie();
    zombies.push({
        id: idZombie,
        steps: 0,
        speed,
        zombieHeight,
        getPosition() {
            return canvas.height / 2 - this.steps * speed;
        },
        angle,
        zombieLifes,
        getCorners() {
            const r = this.getPosition();
            const sector = zombieWidth / r;
            const leftCorner = angle - sector / 2;
            const rightCorner = angle + sector / 2;
            return [leftCorner, rightCorner];
        },
        draw() {
            if (speed * this.steps < canvas.height / 2 - 12) {
                drawSimpleZombie(this.steps, this.zombieLifes);
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
                bulletPosition > zombiePosition + zombie.zombieHeight / 2 &&
                bulletPosition < zombiePosition + zombie.zombieHeight
            ) {
                zombie.zombieLifes -= bullet.bulletDamage;
                drawBloodSplash(
                    bullet.angle,
                    canvas.height / 2 - bulletPosition
                );
                if (!bullet.isRightThrough) {
                    filterByIdAtPlace(bullets, bullet.id);
                }
                if (zombie.zombieLifes < 0) {
                    filterByIdAtPlace(zombies, zombie.id);
                    score++;
                }
            }
        });
    });
}

//----------------------laser collision
function laserCollision() {
    let zombiePosition = laserStopPosition;
    laserStopPosition = zombies.find((zombie) => {
        const [leftCorner, rightCorner] = zombie.getCorners();
        zombiePosition = zombie.getPosition();
        return lookAngle > leftCorner && lookAngle < rightCorner;
    })
        ? canvas.height / 2 - zombiePosition
        : -canvas.height / 2;
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
let lifes = 3;

//----end game

function isEndGame() {
    if (lifes < 0) {
        alert("GAME OVER");
        zombies = [];
        score = 0;
        lifes = 3;
    }
}

//-----faster appearance

//------------------------------------------------------animate
let zero = performance.now();

const simpleZombieDuration = 4000;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLaser();
    drawShooter();
    drawBullets();
    drawSimpleZombies();
    const value =
        (performance.now() - zero) /
        (simpleZombieDuration / Math.log2(score + 3));
    if (value > 1) {
        addSimpleZombie();
        zero = performance.now();
    }
    collision(bullets, zombies);
    laserCollision();
    drawScore();
    drawLifes();
    isEndGame();
    requestAnimationFrame(animate);
}

animate();

document.addEventListener("rotarydetent", function (event) {
    alert("Rotation direction: " + event.detail.direction);
});
