// ==UserScript==
// @name         TarkovMapTrackerAuto
// @namespace    https://github.com/Onzis/TarkovMapTracker
// @author       Onzis
// @version      1.2.4
// @homepageURL  https://github.com/Onzis/TarkovMapTracker
// @updateURL    https://github.com/Onzis/TarkovMapTracker/raw/refs/heads/main/TarkovMapTrackerAuto.user.js
// @downloadURL  https://github.com/Onzis/TarkovMapTracker/raw/refs/heads/main/TarkovMapTrackerAuto.user.js
// @icon         https://raw.githubusercontent.com/Onzis/TarkovMapTracker/main/public/ico/pngegg.png
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
