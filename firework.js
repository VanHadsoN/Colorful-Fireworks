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

    const image = new Image(); // Создаётся объект изобажения

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
    };

    const loop = () => {
        requestAnimationFrame(loop);
        drawWand();
    };
})();