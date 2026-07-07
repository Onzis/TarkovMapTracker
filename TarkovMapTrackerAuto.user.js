// ==UserScript==
// @name         TarkovMapTrackerAuto
// @namespace    https://github.com/Onzis/TarkovMapTracker
// @author       Onzis
// @version      1.1
// @homepageURL  https://github.com/Onzis/TarkovMapTracker
// @updateURL    https://github.com/Onzis/TarkovMapTracker/raw/refs/heads/main/TarkovMapTrackerAuto.user.js
// @downloadURL  https://github.com/Onzis/TarkovMapTracker/raw/refs/heads/main/TarkovMapTrackerAuto.user.js
// @icon
// @description  Автоматический ввод координат из скриншотов без потери фокуса игры
// @license      GPL-3.0 license
// @match        https://tarkov-market.ru/maps/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      tarkov-market.ru/maps/*
// ==/UserScript==

(function() {
    'use strict';

    setInterval(() => {
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://127.0.0.1:12345/",
            onload: function(response) {
                try {
                    let data = JSON.parse(response.responseText);
                    if (data.coords) {
                        // Поиск поля ввода на сайте по тексту внутри плейсхолдера
                        let input = document.querySelector('input[placeholder*="Вставьте сюда имя файла"]');
                        if (input) {
                            input.value = data.coords;

                            // Симуляция ввода для срабатывания внутренних скриптов сайта
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));

                            // Симуляция нажатия Enter
                            let enterEvent = new KeyboardEvent('keydown', {
                                bubbles: true, cancelable: true, key: 'Enter', keyCode: 13
                            });
                            input.dispatchEvent(enterEvent);
                        }
                    }
                } catch(e) {
                    console.error("Ошибка обработки данных:", e);
                }
            },
            onerror: function(err) {
                // Игнорируем ошибки, если сервер Python временно выключен
            }
        });
    }, 1000); // Частота проверки — 1 раз в секунду
})();
