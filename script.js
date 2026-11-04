
const sliderTrack = document.getElementById("sliderTrack");
const sliderHandle = document.getElementById("sliderHandle");
const markersContainer = document.getElementById("markers");
const documentImage = document.getElementById("cmrImage");

const sidePanel = document.querySelector(".side-panel");
const instruction = document.getElementById("instruction");
const infoPanel = document.getElementById("infoPanel");
const mainLayout = document.querySelector(".main-layout");

let progress = 0;
let dragging = false;
let dragOffsetY = 0;

// Последняя вертикальная координата клика относительно документа
let lastClickPosition = null;


// СОЗДАНИЕ МАРКЕРОВ

function createMarkers() {
    markersContainer.innerHTML = "";

    data.forEach(item => {
        const marker = document.createElement("div");

        marker.className = "marker";
        marker.dataset.id = item.id;

        marker.style.top = item.y + "%";
        marker.style.left = item.x + "%";
        marker.style.width = item.w + "%";
        marker.style.height = item.h + "%";
        marker.style.borderColor = item.color;
        marker.style.backgroundColor = item.color + "20";

        // Заголовок подсветки
        const title = document.createElement("div");
        title.className = "marker-title";

        const number = document.createElement("strong");
        number.textContent = item.number + ". ";

        const text = document.createElement("span");
        text.textContent = item.title;

        title.appendChild(number);
        title.appendChild(text);

        marker.appendChild(title);

        marker.addEventListener("click", (event) => {
            showInfoCard(item, event);
        });

        markersContainer.appendChild(marker);
    });
}


// ОБНОВЛЕНИЕ МАРКЕРОВ

function updateMarkers() {
    data.forEach(item => {
        const marker = markersContainer.querySelector(
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


// ОТОБРАЖЕНИЕ КАРТОЧКИ

function showInfoCard(item, event) {
    const card = document.getElementById("infoCard");
    const cardNumber = document.getElementById("cardNumber");
    const cardTitle = document.getElementById("cardTitle");
    const cardContent = document.getElementById("cardContent");

    if (!infoPanel || !card) return;

    card.style.borderLeftColor = item.color;

    cardNumber.textContent = item.number;
    cardNumber.style.color = item.color;

    cardTitle.textContent = item.title;
    cardTitle.style.color = item.color;

    cardContent.innerHTML = `
        <p><strong>Вносим:</strong><br>${item.content.enter}</p>
        <p><strong>Где берем:</strong><br>${item.content.source}</p>
        ${
            item.important
                ? `<p class="important"><strong>Важно:</strong><br>${item.important}</p>`
                : ""
        }
    `;

    // Запоминаем высоту клика относительно изображения
    const imageRect = documentImage.getBoundingClientRect();

    lastClickPosition = event.clientY - imageRect.top;

    infoPanel.classList.add("visible");

    document.getElementById("closeButton").onclick = function() {
        infoPanel.classList.remove("visible");
    };

    updateSidePanelPosition();
}


// ПОЗИЦИЯ ИНСТРУКЦИИ И КАРТОЧКИ

function updateSidePanelPosition() {
    if (!documentImage || !sidePanel || !instruction || !mainLayout) return;

    const imageRect = documentImage.getBoundingClientRect();
    const layoutRect = mainLayout.getBoundingClientRect();

    // МОБИЛЬНАЯ ВЕРСИЯ
    if (window.innerWidth <= 900) {
        sidePanel.style.transform = "none";
        infoPanel.style.top = "auto";
        return;
    }

    // Инструкция у верхнего края документа
    const instructionTop = imageRect.top - layoutRect.top;

    sidePanel.style.transform =
        `translateY(${instructionTop - sidePanel.offsetTop}px)`;

    // Карточка появляется на высоте последнего клика
    if (lastClickPosition !== null) {
        const instructionHeight = instruction.offsetHeight;
        const gap = 16;

        const cardTop = Math.max(
            instructionHeight + gap,
            lastClickPosition
        );

        infoPanel.style.top = cardTop + "px";
    }
}


// РАСЧЁТ ПОЛОЖЕНИЯ ПОЛЗУНКА

function getMaxTop() {
    return Math.max(
        0,
        sliderTrack.clientHeight - sliderHandle.offsetHeight
    );
}


function setHandleTop(top) {
    const maxTop = getMaxTop();

    top = Math.max(0, Math.min(maxTop, top));

    sliderHandle.style.top = top + "px";

    progress = maxTop > 0
        ? (top / maxTop) * 100
        : 0;

    updateMarkers();
    updateSidePanelPosition();
}


function setProgress(value) {
    const normalizedValue = Math.max(0, Math.min(100, value));
    const maxTop = getMaxTop();

    setHandleTop(maxTop * normalizedValue / 100);
}


// ИЗМЕНЕНИЕ ВЫСОТЫ ТРЕКА

function resizeTrack() {
    if (!documentImage || !sliderTrack) return;

    const imageHeight = documentImage.getBoundingClientRect().height;

    if (imageHeight > 0) {
        sliderTrack.style.height = (imageHeight + 30) + "px";
        setProgress(progress);
    }
}


// ПЕРЕМЕЩЕНИЕ ПОЛЗУНКА

function getPointerY(event) {
    return event.clientY;
}


sliderHandle.addEventListener("pointerdown", function(event) {
    dragging = true;

    const handleRect = sliderHandle.getBoundingClientRect();

    dragOffsetY = getPointerY(event) - handleRect.top;

    sliderHandle.setPointerCapture(event.pointerId);
});


sliderHandle.addEventListener("pointermove", function(event) {
    if (!dragging) return;

    const trackRect = sliderTrack.getBoundingClientRect();

    const top =
        getPointerY(event) -
        trackRect.top -
        dragOffsetY;

    setHandleTop(top);
});


sliderHandle.addEventListener("pointerup", function() {
    dragging = false;
});


sliderHandle.addEventListener("pointercancel", function() {
    dragging = false;
});


// КЛИК ПО ТРЕКУ

sliderTrack.addEventListener("pointerdown", function(event) {
    if (
        event.target === sliderHandle ||
        sliderHandle.contains(event.target)
    ) return;

    const trackRect = sliderTrack.getBoundingClientRect();

    const top =
        getPointerY(event) -
        trackRect.top -
        sliderHandle.offsetHeight / 2;

    setHandleTop(top);
});


// ИНИЦИАЛИЗАЦИЯ

function initializeSlider() {
    createMarkers();
    resizeTrack();
    setProgress(0);
    updateSidePanelPosition();
}


if (documentImage.complete && documentImage.naturalHeight > 0) {
    initializeSlider();
} else {
    documentImage.addEventListener("load", initializeSlider, { once: true });
}


// ИЗМЕНЕНИЕ РАЗМЕРА ОКНА

window.addEventListener("resize", resizeTrack);
