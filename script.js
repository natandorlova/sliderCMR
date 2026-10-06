const sliderTrack = document.getElementById("sliderTrack");
const sliderHandle = document.getElementById("sliderHandle");

const markersContainer = document.getElementById("markers");

const documentImage = document.querySelector(".invoice-image");

let progress = 0;
let dragging = false;


// =====================================================
// СОЗДАНИЕ ПОЛЕЙ
// =====================================================

function createMarkers() {

    markersContainer.innerHTML = "";

    data.forEach(item => {

        const marker = document.createElement("div");

        marker.className = "marker";
        marker.dataset.id = item.id;

        marker.style.left = item.x + "%";
        marker.style.top = item.y + "%";
        marker.style.width = item.w + "%";
        marker.style.height = item.h + "%";

        marker.style.borderColor = item.color;

        /*
         * Цветная полупрозрачная заливка
         */
        marker.style.background = hexToRgba(item.color, 0.28);


        // -------------------------------
        // НОМЕР + НАЗВАНИЕ
        // -------------------------------

        const title = document.createElement("div");

        title.className = "marker-title";

        title.innerHTML =
            `<strong>${item.number}</strong> ${item.title}`;

        title.style.color = item.color;

        marker.appendChild(title);


        // -------------------------------
        // КЛИК
        // -------------------------------

        marker.addEventListener("click", function(e) {

            e.stopPropagation();

            showInfoCard(item);

        });


        markersContainer.appendChild(marker);

    });

}


// =====================================================
// ПРЕОБРАЗОВАНИЕ HEX В RGBA
// =====================================================

function hexToRgba(hex, alpha) {

    hex = hex.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}


// =====================================================
// ПОКАЗ ПОЛЕЙ
// =====================================================

function updateMarkers() {

    data.forEach(item => {

        const marker =
            document.querySelector(
                `.marker[data-id="${item.id}"]`
            );

        if (!marker) return;


        if (progress >= item.showAt) {

            marker.classList.add("active");

        } else {

            marker.classList.remove("active");

        }

    });

}


// =====================================================
// КАРТОЧКА С ОПИСАНИЕМ
// =====================================================

function showInfoCard(item) {
    let panel = document.getElementById("infoPanel");

    if (!panel) {
        panel = document.createElement("div");
        panel.id = "infoPanel";
        panel.className = "info-panel";

        const sidePanel = document.querySelector(".side-panel");

        if (sidePanel) {
            sidePanel.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }
    }

    panel.innerHTML = `
        <button class="close-button" type="button" aria-label="Закрыть">×</button>

        <div class="info-card" style="border-left-color:${item.color}">

            <div class="info-number" style="color:${item.color}">
                ${item.number}
            </div>

            <h3 style="color:${item.color}">
                ${item.title}
            </h3>

            <p>
                <strong>Вносим:</strong><br>
                ${item.content.enter}
            </p>

            <p>
                <strong>Где берем:</strong><br>
                ${item.content.source}
            </p>

            ${
                item.important
                ? `
                <p class="important">
                    <strong>Важно:</strong><br>
                    ${item.important}
                </p>
                `
                : ""
            }

        </div>
    `;

    const closeButton = panel.querySelector(".close-button");

    closeButton.addEventListener("click", function() {
        panel.classList.remove("visible");
    });

    panel.classList.add("visible");
}


    // -------------------------------
    // СОДЕРЖИМОЕ КАРТОЧКИ
    // -------------------------------

    panel.innerHTML = `

        <button class="close-button"
                type="button"
                aria-label="Закрыть">
            ×
        </button>

        <div class="info-card"
             style="border-left-color:${item.color}">

            <div class="info-number"
                 style="color:${item.color}">
                ${item.number}
            </div>

            <h3 style="color:${item.color}">
                ${item.title}
            </h3>

            <p>
                <strong>Вносим:</strong><br>
                ${item.content.enter}
            </p>

            <p>
                <strong>Где берем:</strong><br>
                ${item.content.source}
            </p>

            ${
                item.important
                ?
                `
                <p class="important">
                    <strong>Важно:</strong><br>
                    ${item.important}
                </p>
                `
                :
                ""
            }

        </div>

    `;


    // -------------------------------
    // КРЕСТИК
    // -------------------------------

    const closeButton =
        panel.querySelector(".close-button");

    closeButton.addEventListener("click", function() {

        panel.classList.remove("visible");

    });


    // -------------------------------
    // ПОКАЗ
    // -------------------------------

    panel.classList.add("visible");

}


// =====================================================
// ДВИЖЕНИЕ ПОЛЗУНКА
// =====================================================

function setProgress(value) {

    progress = Math.max(
        0,
        Math.min(100, value)
    );


    sliderHandle.style.top =
        progress + "%";


    updateMarkers();

}


// =====================================================
// ПОЛУЧАЕМ ПРОЦЕНТ ПО ПОЛОЖЕНИЮ КУРСОРА
// =====================================================

function getProgress(clientY) {

    const rect =
        sliderTrack.getBoundingClientRect();


    let value =
        (
            (clientY - rect.top)
            /
            rect.height
        ) * 100;


    return Math.max(
        0,
        Math.min(100, value)
    );

}


// =====================================================
// ВЫСОТА ТРЕКА = ВЫСОТА ДОКУМЕНТА
// =====================================================

function resizeTrack() {

    if (!documentImage) return;

    const height =
        documentImage.getBoundingClientRect().height;

    sliderTrack.style.height =
        height + "px";

}


// =====================================================
// НАЧАЛО ПЕРЕТАСКИВАНИЯ
// =====================================================

sliderHandle.addEventListener(
    "pointerdown",
    function(e) {

        dragging = true;

        sliderHandle.setPointerCapture(
            e.pointerId
        );

        e.preventDefault();

    }
);


// =====================================================
// ДВИЖЕНИЕ
// =====================================================

sliderHandle.addEventListener(
    "pointermove",
    function(e) {

        if (!dragging) return;

        setProgress(
            getProgress(e.clientY)
        );

    }
);


// =====================================================
// ОКОНЧАНИЕ
// =====================================================

sliderHandle.addEventListener(
    "pointerup",
    function(e) {

        dragging = false;

        try {

            sliderHandle.releasePointerCapture(
                e.pointerId
            );

        } catch(error) {}

    }
);


sliderHandle.addEventListener(
    "pointercancel",
    function() {

        dragging = false;

    }
);


// =====================================================
// КЛИК ПО САМОМУ ТРЕКУ
// Можно сразу переместить ползунок
// =====================================================

sliderTrack.addEventListener(
    "pointerdown",
    function(e) {

        if (e.target === sliderHandle ||
            sliderHandle.contains(e.target)) {

            return;

        }


        setProgress(
            getProgress(e.clientY)
        );

    }
);


// =====================================================
// ЗАПУСК
// =====================================================

window.addEventListener(
    "load",
    function() {

        createMarkers();

        resizeTrack();

        setProgress(0);

    }
);


// =====================================================
// RESIZE
// =====================================================

window.addEventListener(
    "resize",
    function() {

        resizeTrack();

    }
);
