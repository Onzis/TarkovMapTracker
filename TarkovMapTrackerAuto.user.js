// ==UserScript==
// @name         TarkovMapTrackerAuto
// @namespace    https://github.com/Onzis/TarkovMapTracker
// @author       Onzis
// @version      1.2.4.1
// @homepageURL  https://github.com/Onzis/TarkovMapTracker
// @updateURL    https://github.com/Onzis/TarkovMapTracker/raw/refs/heads/main/TarkovMapTrackerAuto.user.js
// @downloadURL  https://github.com/Onzis/TarkovMapTracker/raw/refs/heads/main/TarkovMapTrackerAuto.user.js
// @icon         data:image/png;base64,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
// @description  Автоматический ввод координат из скриншотов без потери фокуса игры
// @license      GPL-3.0 license
// @match        https://tarkov-market.ru/*
// @match        https://tarkov-market.ru/maps/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      tarkov-market.ru/maps/*
// ==/UserScript==

(function() {
    'use strict';

    // НАСТРОЙКА ПОВОРОТА СТРЕЛКИ (если потребуется):
    // Если заметите, что стрелка смотрит вбок относительно персонажа,
    // измените этот угол (например: 90, 180, -90) для калибровки «Севера» на карте.
    const ARROW_CORRECTION_ANGLE = 0;

    // Работаем только на страницах карт (переживаем SPA-навигацию без перезагрузки)
    function onMap() {
        return location.pathname.indexOf('/maps/') === 0;
    }

    // Функция отрисовки стрелки внутри стандартного маркера сайта
    function renderDirectionArrow() {
        if (!onMap()) return;
        // Находим элемент маркера, который вы нашли в коде страницы
        let marker = document.querySelector('div.marker');

        if (marker) {
            // Разрешаем элементам выходить за пределы круглого маркера
            marker.style.overflow = 'visible';

            // Если стрелка еще не добавлена — создаем её
            if (!document.getElementById('tarkov-native-arrow')) {
                let arrowContainer = document.createElement('div');
                arrowContainer.id = 'tarkov-native-arrow';

                // Центрируем контейнер стрелки внутри маркера
                arrowContainer.style.position = 'absolute';
                arrowContainer.style.top = '0';
                arrowContainer.style.left = '0';
                arrowContainer.style.width = '100%';
                arrowContainer.style.height = '100%';
                arrowContainer.style.overflow = 'visible';
                arrowContainer.style.pointerEvents = 'none';

                // Создаем SVG-стрелку, направленную строго вверх (0 градусов)
                // Она автоматически унаследует поворот родительского div.marker от сайта
                arrowContainer.innerHTML = `
                    <svg width="100%" height="100%" viewBox="0 0 20 20" style="overflow: visible; transform: rotate(${ARROW_CORRECTION_ANGLE}deg);">
                        <polygon points="10,-12 19,16 10,9 1,16" fill="#00ffff" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                `;

                marker.appendChild(arrowContainer);
            }
        }
    }

    // Постоянно проверяем и обновляем маркер (каждые 50мс для плавной анимации при движении карты)
    setInterval(renderDirectionArrow, 50);

    // Логика автоматического получения скриншотов из Python
    setInterval(() => {
        if (!onMap()) return;
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://127.0.0.1:12345/",
            onload: function(response) {
                try {
                    let data = JSON.parse(response.responseText);
                    if (data.coords) {
                        let input = document.querySelector('input[placeholder*="Вставьте сюда имя файла"]');
                        if (input) {
                            // Передаем строку, сайт сам считает координаты и угол rotate(...)
                            input.value = data.coords;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));

                            // Эмулируем нажатие Enter для подтверждения ввода на сайте
                            const eventOptions = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 };
                            input.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
                        }
                    }
                } catch(e) {
                    console.error("Ошибка авто-ввода:", e);
                }
            }
        });
    }, 1000);

    // Автоматически нажимаем «Где я?» при заходе на карту,
    // чтобы активировать режим ввода координат со скриншота (без ручного клика).
    function findWhereButton() {
        let btns = document.querySelectorAll('button.no-wrap');
        for (let b of btns) {
            if (b.textContent.trim() === 'Где я?') return b;
        }
        return null;
    }

    let lastWhereBtn = null;
    setInterval(() => {
        if (!onMap()) { lastWhereBtn = null; return; }
        let btn = findWhereButton();
        if (!btn) {
            // Кнопка исчезла (вышли с карты / сменили карту) — сбрасываем,
            // чтобы при повторном появлении кликнуть снова.
            lastWhereBtn = null;
            return;
        }
        // Кликаем один раз для каждого нового экземпляра кнопки.
        if (btn !== lastWhereBtn) {
            btn.click();
            lastWhereBtn = btn;
            console.log('TarkovMapTracker: авто-клик «Где я?»');
        }
    }, 1000);
})();
