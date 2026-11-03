const sliderTrack = document.getElementById("sliderTrack");
const sliderHandle = document.getElementById("sliderHandle");
const markersContainer = document.getElementById("markers");
const documentImage = document.getElementById("cmrImage");

let progress = 0;
let dragging = false;

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
        marker.style.background = hexToRgba(item.color, 0.28);

        const title = document.createElement("div");

        title.className = "marker-title";
        title.innerHTML = `<strong>${item.number}</strong> ${item.title}`;
        title.style.color = item.color;

        marker.appendChild(title);

        marker.addEventListener("click", function(e) {
            e.stopPropagation();
            showInfoCard(item);
        });

        markersContainer.appendChild(marker);
    });
}

function hexToRgba(hex, alpha) {
    hex = hex.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

function showInfoCard(item) {
    const panel = document.getElementById("infoPanel");

    const card = document.getElementById("infoCard");
    const cardNumber = document.getElementById("cardNumber");
    const cardTitle = document.getElementById("cardTitle");
    const cardContent = document.getElementById("cardContent");

    if (!panel || !card) return;

    card.style.borderLeftColor = item.color;

    cardNumber.textContent = item.number;
    cardNumber.style.color = item.color;

    cardTitle.textContent = item.title;
    cardTitle.style.color = item.color;

    cardContent.innerHTML = `
        <p>
            <strong>Вносим:</strong><br>
            ${item.content.enter}
        </p>

        <p>
            <strong>Где берем:</strong><br>
            ${item.content.source}
        </p>

        ${item.important ? `
            <p class="important">
                <strong>Важно:</strong><br>
                ${item.important}
            </p>
        ` : ""}
    `;

    // Карточка появляется в правой колонке под инструкцией
    panel.classList.add("visible");

    document.getElementById("closeButton").onclick = function() {
        panel.classList.remove("visible");
    };
}

function setProgress(value) {
    progress = Math.max(0, Math.min(100, value));

    sliderHandle.style.top = progress + "%";

    updateMarkers();
}

function getProgress(clientY) {
    const rect = sliderTrack.getBoundingClientRect();

    if (!rect.height) return 0;

    const value = ((clientY - rect.top) / rect.height) * 100;

    return Math.max(0, Math.min(100, value));
}

function resizeTrack() {
    if (!documentImage || !sliderTrack) return;

    const imageHeight = documentImage.getBoundingClientRect().height;

    if (imageHeight > 0) {
        sliderTrack.style.height = imageHeight + "px";
    }
}

// Перетаскивание ползунка

sliderHandle.addEventListener("pointerdown", function(e) {
    dragging = true;

    sliderHandle.setPointerCapture(e.pointerId);

    e.preventDefault();
});

sliderHandle.addEventListener("pointermove", function(e) {
    if (!dragging) return;

    setProgress(getProgress(e.clientY));
});

sliderHandle.addEventListener("pointerup", function(e) {
    dragging = false;

    try {
        sliderHandle.releasePointerCapture(e.pointerId);
    } catch(error) {}
});

sliderHandle.addEventListener("pointercancel", function() {
    dragging = false;
});

// Клик по дорожке ползунка

sliderTrack.addEventListener("pointerdown", function(e) {
    if (
        e.target === sliderHandle ||
        sliderHandle.contains(e.target)
    ) {
        return;
    }

    setProgress(getProgress(e.clientY));
});

// Инициализация

function initializeSlider() {
    createMarkers();
    resizeTrack();
    setProgress(0);
}

if (documentImage.complete && documentImage.naturalHeight > 0) {
    initializeSlider();
} else {
    documentImage.addEventListener("load", initializeSlider, { once: true });
}

window.addEventListener("resize", resizeTrack);
