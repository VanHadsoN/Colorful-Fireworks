(() => {
    const canvas= document.getElementById("background"); // Эта строка получает элемент canvas из DOM по его идентификатору "background"
    const context = canvas.getContext("2d"); // Здесь мы получаем контекст рисования 2D для элемента canvas

    const width = window.innerWidth; // Получаем ширину текущего окна браузера
    const height = window.innerHeight; //  Получаем высоту текущего окна браузера

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
})();