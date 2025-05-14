(() => {
    const canvas= document.getElementById("background"); // Эта строка получает элемент canvas из DOM по его идентификатору "background"
    const context = canvas.getContext("2d"); // Здесь мы получаем контекст рисования 2D для элемента canvas

    const width = window.innerWidth; // Получаем ширину текущего окна браузера
    const height = window.innerHeight; //  Получаем высоту текущего окна браузера

    const numberOfStars = 50; // задаем количество звёзд на небе
    const random = (min, max) => Math.random() * (max - min) + min; // функция random возвращает случайное число в заданном диапазоне [min, max) каждый раз при вызове

    // устанавливаем canvas по ширине, высоте окна браузера
    canvas.width = width;
    canvas.height = height;

    const drawBackground = () => {
        // начинается с x, y до x1, y1
        const background = context.createLinearGradient(0,0,0, height); // Здесь создается линейный градиент, который идёт сверху вниз
        // Здесь добавляются цвета в градиент
        background.addColorStop(0, '#000B27');
        background.addColorStop(1, '#6C2484');

        context.fillStyle = background; // Применение градиента как фона
        context.fillRect(0, 0, width, height); // Рисование прямоугольника на весь экран
    };

    const drawForeground = () => {
        context.fillStyle = '#0C1D2D'; // Устанавливаем цвет тёмно-синий с примесью серого
        context.fillRect(0, height * 0.95, width, height); // Рисуем прямоугольник, который начинается на 95% высоты экрана и продолжается вниз до конца

        context.fillStyle = '#182746'; // Меняем цвет на чуть светлее и синее
        context.fillRect(0, height * 0.955, width, height); // Рисуем ещё один прямоугольник, который начинается чуть ниже и тоже продолжается вниз
    };

    const drawWizard = () => { // Функция drawWizard загружает картинку волшебника и рисует её в нижнем правом углу канваса — но чуть сдвинутую внутрь, чтобы аккуратно вписалась
        const image = new Image(); // Создаётся новый объект Image
        image.src = './assets/wizard2.png'; // Задаётся путь к файлу картинки

        image.onload = function () { // Как только картинка волшебника загрузится, выполнится эта функция
            /*
            * this - ссылается на объект изображения
            * рисуем на 90% ширины холста - ширину изображения
            * рисуем на 95% высоты холста - высоту изображения
            */
            context.drawImage(this, (width * 0.1) - this.width, (height * 0.956) - this.height);
        };
    };
    const drawStars = () => { // Функция drawStars рисует 50 маленьких белых квадратиков в случайных местах верхней части канваса — получается имитация ночного неба со звёздами
        let starCount = numberOfStars;

        context.fillStyle = '#FFF'; // Устанавливаем белый цвет заливки

        while (starCount--) { // Цикл, который будет крутиться, пока starCount не станет 0, уменьшается на 1 при каждой итерации, т.е. 50 раз
            const x = random(25, width - 50); // Случайная координата по горизонтали от 25 до ширины канваса минус 50. То есть звёзды не будут прямо у краёв.
            const y = random(25, height * 0.5); // Случайная координата по вертикали от 25 до половины высоты канваса. Типа "небо" занимает верхнюю часть.
            const size = random(1, 5); // Случайный размер звезды от 1 до 5 пикселей. Маленькие точки — реалистично.

            context.fillRect(x, y, size, size); // Рисуем белый прямоугольник (по сути — квадратик) на канвасе
        }
    };
    drawBackground();
    drawForeground();
    drawWizard();
    drawStars();
})();