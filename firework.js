(() => { // IIFE - Это самовызывающаяся функция. То есть она определяется и тут же выполняется
    const canvas = document.getElementById('firework'); // Ищем на странице элемент <canvas id="firework"> и кладём его в переменную canvas
    const context = canvas.getContext('2d'); // Получаем 2D-контекст — именно с ним мы рисуем всякие штуки на канвасе

    const width = window.innerWidth; // Запоминаем размеры окна браузера
    const height = window.innerHeight; // Мы собираемся подстроить канвас под весь экран

    const positions = { // Объявляется объект positions, в котором будут храниться координаты мышки и волшебной палочки
        mouseX: 0,
        mouseY: 0,
        wandX: 0,
        wandY: 0
    };

    const fireworks = [];
    const particles = [];
    const numberOfParticles = 50; // производительность будет снижаться с увеличением числа частиц выше 50

    const random = (min, max) => Math.random() * (max - min) + min;

    const getDistance = (x1, y1, x2, y2) => {
        const xDistance = x1 - x2;
        const yDistance = y1 - y2;

        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    };

    const image = new Image(); // Создаётся объект изобажения

    let mouseClicked = false;

    canvas.width = width; // Делаем канвас по размеру экрана
    canvas.height = height; // Растягиваем его полностью

    image.src = './assets/wand.png'; // Указываем путь к изображению палочки
    image.onload = () => { // Когда картинка загрузится
        attachEventListeners(); // Функция, которая будет слушать движения мыши
        loop(); // Функция, которая запускает главный анимационный цикл. Без неё ничего происходить не будет
    }

    const drawWand = () => {
        positions.wandX = (width * 0.91) - image.width;
        positions.wandY = (height * 0.93) - image.height;

        const rotationInRadians = Math.atan2(positions.mouseY - positions.wandY, positions.mouseX - positions.wandX) - Math.PI;
        const rotationInDegrees = (rotationInRadians * 180 / Math.PI) + 360;

        context.clearRect(0, 0, width, height);

        // Сохраняем контекст для последующего удаления преобразований
        context.save();
        context.translate(positions.wandX, positions.wandY);

        if (rotationInDegrees > 0 && rotationInDegrees < 90) {
            context.rotate(rotationInDegrees * Math.PI / 180); // Необходимо преобразовать обратно в радианы
        } else if (rotationInDegrees > 90 && rotationInDegrees < 275) {
            context.rotate(90 * Math.PI / 180); // Поворот на 90 градусов, если курсор выходит за пределы 90 градусов
        }

        context.drawImage(image, -image.width, -image.height / 2); // Необходимо расположить якорь в правой средней части изображения

        // Можно нарисовать обводку вокруг текста, чтобы увидеть где находятся края
        // context.strokeRect(0, 0, width, height);
        context.restore();
    };

    const attachEventListeners = () => { // Эта строка говорит: "Если мышка двигается по канвасу — запоминай, где она сейчас."
        canvas.addEventListener('mousemove', e => {
            positions.mouseX = e.pageX;
            positions.mouseY = e.pageY;
        });

        canvas.addEventListener('mousedown', () => mouseClicked = true);
        canvas.addEventListener('mouseup', () => mouseClicked = false);
    };

    const loop = () => {
        requestAnimationFrame(loop);
        drawWand();
    };

    function Firework() {
        const init = () => {
            let fireworkLength = 10;

            // текущие координаты
            this.x = positions.wandX;
            this.y = positions.wandY;

            // координаты цели
            this.tx = positions.mouseX;
            this.ty = positions.mouseY;

            // расстояние со стартовой точки до цели
            this.distanceToTarget = getDistance(positions.wandX, positions.wandY, this.tx, this.ty);
            this.distanceTraveled = 0;

            this.coordinates = [];
            this.angle = Math.atan2(this.ty - positions.wandY, this.tx - positions.wandX);
            this.speed = 20;
            this.friction = 0.99; // снижаем скорость на 1% каждый кадр
            this.hue = random(0, 360); // случайный оттенок (обозначенный как hue) задаваемый для следа

            while (fireworkLength--) {
                this.coordinates.push([this.x, this.y]);
            }
        };

        this.animate = index => {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.speed *= this.friction;

            let vx = Math.cos(this.angle) * this.speed;
            let vy = Math.sin(this.angle) * this.speed;

            this.distanceTraveled = getDistance(positions.wandX, positions.wandY, this.x + vx, this.y + vy);

            if(this.distanceTraveled >= this.distanceToTarget) {
                let i = numberOfParticles;

                while(i--) {
                    particles.push(new Particle(this.tx, this.ty));
                }

                fireworks.splice(index, 1)
            } else {
                this.x += vx;
                this.y += vy;
            }
        }

        this.draw = index => {
            context.beginPath();
            context.moveTo(this.coordinates[this.coordinates.length - 1][0],
                           this.coordinates[this.coordinates.length - 1][1]);
            context.lineTo(this.x, this.y);

            context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
            context.stroke();

            this.animate(index);
        }

        init();
    }
})();