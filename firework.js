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

    const random = (min, max) => Math.random() * (max - min) + min; // используется для случайного распределения частиц в феерверке

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
        positions.wandX = (width * 0.110) - image.width;
        positions.wandY = (height * 0.915) - image.height;

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

        canvas.addEventListener('mousedown', () => mouseClicked = true); // Срабатывает, когда нажата левая кнопка мыши
        canvas.addEventListener('mouseup', () => mouseClicked = false); // Срабатывает, когда кнопку мыши отпускают
    };

    const loop = () => { // это основной цикл, он же цикл отрисовки, эта функция будет выполняться каждый кадр, пока открыта страница
        requestAnimationFrame(loop); // эта функция вызывает loop снова и снова синхронизируясь с частотой обновления экрана (т.е. это рекурсия с turbo mode без пергрузки процессора)
        drawWand(); // это отрисовка палочки

        if(mouseClicked) { // если пользователь нажал на мышь
            fireworks.push(new Firework()); // создаём новый феерверк, пушим его в массив fireworks
        }

        let fireworkIndex = fireworks.length;
        while(fireworkIndex--) { // цикл перербирает все феерверки, начиная с конца массива
            fireworks[fireworkIndex].draw(fireworkIndex); // метод делает 2 вещи: рисует феерверк и его шлейф; анимирует его движение и проверяет взорвался ли он
        }

        let particleIndex = particles.length;
        while(particleIndex--) {
            particles[particleIndex].draw(particleIndex);
        }
    };

    function Firework() {
        const init = () => {
            let fireworkLength = 10; // определяет, сколько "следов" (координатных точек) будет оставлять фейерверк, чтобы получился красивый шлейф за ним

            // начальные координаты
            this.x = positions.wandX;
            this.y = positions.wandY;

            // координаты цели
            this.tx = positions.mouseX;
            this.ty = positions.mouseY;

            // рассчёт расстояния со стартовой точки до цели
            this.distanceToTarget = getDistance(positions.wandX, positions.wandY, this.tx, this.ty);
            this.distanceTraveled = 0;

            this.coordinates = []; // Создаётся массив координат для "шлейфа" фейерверка. Он будет обновляться при движении, создавая эффект хвоста, как у кометы
            this.angle = Math.atan2(this.ty - positions.wandY, this.tx - positions.wandX); // Считается угол между стартовой точкой и целью — чтобы знать, в каком направлении лететь
            this.speed = 20;
            this.friction = 0.99; // снижаем скорость на 1% каждый кадр
            this.hue = random(0, 360); // случайный оттенок (обозначенный как hue) задаваемый для следа

            while (fireworkLength--) {
                this.coordinates.push([this.x, this.y]);
            }
        };

        this.animate = index => { // отвечает за движение фейерверка по экрану и его "взрыв", когда он долетает до цели
            this.coordinates.pop(); // Удаляет самую старую точку шлейфа (хвоста) фейерверка — то, что было позади
            this.coordinates.unshift([this.x, this.y]); // Добавляет новую текущую позицию в начало массива шлейфа. Это обновляет хвост, чтобы он «тянулся» за фейерверком

            this.speed *= this.friction; // Постепенно замедляем фейерверк, умножая скорость на коэффициент трения (обычно чуть меньше 1)

            let vx = Math.cos(this.angle) * this.speed; // это смещение по оси x
            let vy = Math.sin(this.angle) * this.speed; // это смещение по оси y

            this.distanceTraveled = getDistance(positions.wandX, positions.wandY, this.x + vx, this.y + vy); // Считаем, насколько далеко фейерверк уже пролетел от старта (wandX, wandY) до новой позиции (this.x + vx, this.y + vy)

            if(this.distanceTraveled >= this.distanceToTarget) { // Если расстояние, которое он пролетел, больше или равно расстоянию до цели — значит, он долетел
                let i = numberOfParticles;

                while(i--) {
                    particles.push(new Particle(this.tx, this.ty));
                }

                fireworks.splice(index, 1) // Удаляем этот фейерверк из массива fireworks, т.к. он уже "взорвался" и больше не нужен
            } else { // иначе - если не долетел — просто сдвигаем фейерверк вперёд по рассчитанному направлению
                this.x += vx;
                this.y += vy;
            }
        }

        this.draw = index => { // метод, который рисует линию — сам фейерверк и его шлейф и вызывает анимацию — чтобы фейерверк двигался
            context.beginPath(); // Начинаем новый путь рисования на канвасе
            context.moveTo(this.coordinates[this.coordinates.length - 1][0],
                           this.coordinates[this.coordinates.length - 1][1]); // перемещаем "кисть" к самой старой точке шлейфа
            context.lineTo(this.x, this.y); // рисуем линию до текущего положения фейерверка

            context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
            /* цвет линии: цвет определяется в формате HSL (оттенок, насыщенность, яркость);
            this.hue — это случайный цвет, который был задан при инициализации;
            100% насыщенности и 50% яркости — чтобы цвета были сочные */
            context.stroke(); // Рисуем саму линию, то есть "проявляем" путь, который задали выше

            this.animate(index); // После того как фейерверк отрисован — вызывается метод animate, который обновляет его позицию, скорость и запускает взрыв, если нужно
        }

        init();
    }

    function Particle(x, y) { // функция-конструктор частиц
        const init = () => { // настраивает параметры конкретной частицы
            let particleLength = 7; // искра оставит след из 7 точек, это её хвост

            this.x = x; // начальное положение - прямо в точке где взорвался феерверк
            this.y = y;

            this.coordinates = []; // массив нужен для хранения истории предыдущих координат

            this.angle = random(0, Math.PI * 2); // искра получает случайный угол направления - от 0 до 360 градусов (в радианах)
            this.speed = random(1, 10); // каждая искра двигается с разной скоростью

            this.friction = 0.95; // скорость искры будет снижаться со временем (замедляется каждый кадр на 5%)
            this.gravity = 2; // каждая искра будет падать вниз будто бы под действием гравитации

            this.hue = random(0, 360); // цвет каждой искры случайный
            this.alpha = 1; // полная непрозрачность
            this.decay = random(0.015, 0.03); // регулирует насколько быстро частица становится прозрачной (и исчезает)

            while(particleLength--) {
                this.coordinates.push([this.x, this.y]); // создаёт массив из одинаковых координат [x, y] - это стартовые точки для хвоста искры
            }
        };

        this.animate = index => { // это изненный путь искры - один кадр жизни частицы
            this.coordinates.pop(); // удаляет самую старую координату из массива хвоста (coordinates), чтобы он не рос вечно
            this.coordinates.unshift([this.x, this.y]); // добавляет текущие координаты в начало массива

            this.speed *= this.friction; // частица замедляется каждый кадр на 5% (если friction = 0.95)

            this.x += Math.cos(this.angle) * this.speed; // движение частицы по оси x
            this.y += Math.sin(this.angle) * this.speed + this.gravity; // движение частицы по оси y + падние вниз со временем

            this.alpha -= this.decay; // частица становится всё более прозрачной с каждым кадром (alpha — это её "прозрачность" (1 = полностью видима, 0 = полностью исчезла))

            if (this.alpha <= this.decay) { // когда alpha становится слишком маленьким (почти 0) - частица считается мертвой
                particles.splice(index, 1); // частица удаляется из массива particles
            }
        }

        this.draw = index => { // то как частица рисуется на холсте (canvas)
            context.beginPath(); // начало отрисовки нового пути
            context.moveTo(this.coordinates[this.coordinates.length - 1][0],
                           this.coordinates[this.coordinates.length - 1][1]); // рисуется линия от старой позиции
            context.lineTo(this.x, this.y); // рисуется линия к текущей позиции

            context.strokeStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`; // задаётся цвет линии (оттенок, насыщенность, светлота, прозрачность)
            context.stroke(); // сам процесс отрисовки подготовленной линии на канвасе

            this.animate(index); // анимирует частицу: меняет её координаты, прозрачность, скорость и убивает частицу, если она уже угасла (alpha становится слишком маленьким)
        }

        init();
    }
})();