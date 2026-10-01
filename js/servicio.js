/**
 * ==========================================================================
 * SUITE DE HERRAMIENTAS OFIMÁTICAS Y TI - MINI BRUNO SUCESORES C.A.
 * 100% Client-Side Processing, Privacy-First & Zero-Server-Upload
 * ==========================================================================
 */

import { auth, onAuthStateChanged, signOut } from "./firebase-init.js";

let authorizedEmails = [];

document.addEventListener("DOMContentLoaded", async () => {
    // Inicializar Iconos Feather
    if (window.feather) window.feather.replace();

    // 0. Cargar lista de correos autorizados y validar acceso
    await loadAuthorizedEmails();
    initServiceAuthGuard();

    // 1. GESTOR DE PESTAÑAS (TABS)
    initTabManager();

    // 2. GENERADOR DE CÓDIGOS QR
    initQRGenerator();

    // 3. CONVERSOR BIDIRECCIONAL EXCEL ⇄ CSV
    initExcelCsvConverter();

    // 4. MONITOR DE DIVISAS VENEZUELA (BCV & USDT)
    initCurrencyMonitor();

    // 5. UTILIDADES TI (Contraseñas, Subredes IPv4, Formateador de Texto)
    initPasswordGenerator();
    initCidrCalculator();
    initTextSanitizer();
});

// ==========================================================================
// 0. CONTROL DE ACCESO (SECURITY GATEWAY PARA SERVICIO.HTML)
// ==========================================================================
async function loadAuthorizedEmails() {
    try {
        const res = await fetch("/js/correos_Autorizados.json");
        if (res.ok) {
            const data = await res.json();
            authorizedEmails = (data.autorizados || []).map((e) => e.toLowerCase().trim());
        } else {
            authorizedEmails = [
                "lruiz@minibruno.com",
                "lguevara@minibruno.com",
                "mrodriguez@minibruno.com",
                "jnanez@minibruno.com",
                "dnavarro@minibruno.com",
                "darwin.navarro@minibruno.com",
                "bmontilla@minibruno.com",
                "alves.neri@minibruno.com",
                "jruiz@minibruno.com",
                "rcoronado@minibruno.com",
                "ruca.luijo@gmail.com"
            ];
        }
    } catch (err) {
        console.error("Error al cargar lista de correos autorizados:", err);
    }
}

function initServiceAuthGuard() {
    const loadingScreen = document.getElementById("auth-loading-screen");
    const deniedScreen = document.getElementById("access-denied-screen");
    const authorizedContent = document.getElementById("authorized-content");
    const deniedStatusText = document.getElementById("denied-status-text");

    onAuthStateChanged(auth, (user) => {
        if (loadingScreen) loadingScreen.classList.add("hidden");

        if (!user) {
            // Usuario no autenticado
            if (authorizedContent) authorizedContent.classList.add("hidden");
            if (deniedScreen) deniedScreen.classList.remove("hidden");
            if (deniedStatusText) {
                deniedStatusText.textContent = "No has iniciado sesión en el sistema. Debes ingresar con tu cuenta corporativa autorizada.";
            }
        } else {
            const email = (user.email || "").toLowerCase().trim();
            const isAuthorized = authorizedEmails.includes(email);

            if (isAuthorized) {
                // Usuario AUTORIZADO: Desbloquear suite completa
                if (deniedScreen) deniedScreen.classList.add("hidden");
                if (authorizedContent) {
                    authorizedContent.classList.remove("hidden");
                    setTimeout(() => {
                        if (window.AOS) {
                            window.AOS.init({
                                duration: 800,
                                easing: "ease-out-cubic",
                                once: false,
                                offset: 80
                            });
                            window.AOS.refreshHard();
                        }
                    }, 120);
                }
            } else {
                // Usuario autenticado pero NO está en correos_Autorizados.json
                if (authorizedContent) authorizedContent.classList.add("hidden");
                if (deniedScreen) deniedScreen.classList.remove("hidden");
                if (deniedStatusText) {
                    deniedStatusText.textContent = `Sesión activa como: ${user.email} (Esta cuenta no tiene privilegios de Staff o TI).`;
                }
            }
        }

        if (window.feather) window.feather.replace();
    });
}

// ==========================================================================
// TOAST NOTIFICATIONS HELPER
// ==========================================================================
function showToast(message, isSuccess = true) {
    const toast = document.getElementById("suite-toast");
    const toastMsg = document.getElementById("suite-toast-msg");
    const toastIcon = document.getElementById("suite-toast-icon");
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    if (toastIcon) {
        toastIcon.setAttribute("data-feather", isSuccess ? "check-circle" : "alert-circle");
        toastIcon.className = isSuccess ? "w-4 h-4 text-emerald-400" : "w-4 h-4 text-rose-400";
        if (window.feather) window.feather.replace();
    }

    toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");
    toast.classList.add("translate-y-0", "opacity-100");

    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(() => {
        toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
        toast.classList.remove("translate-y-0", "opacity-100");
    }, 3000);
}

// ==========================================================================
// 1. GESTOR DE PESTAÑAS (TABS)
// ==========================================================================
function initTabManager() {
    const tabBtns = document.querySelectorAll(".tool-tab-btn");
    const panels = document.querySelectorAll(".tool-panel");

    function switchTab(targetTabId) {
        tabBtns.forEach((btn) => {
            if (btn.getAttribute("data-tab") === targetTabId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        panels.forEach((panel) => {
            if (panel.id === targetTabId) {
                panel.classList.remove("hidden");
                panel.classList.add("block");
            } else {
                panel.classList.add("hidden");
                panel.classList.remove("block");
            }
        });

        if (window.feather) window.feather.replace();
    }

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");
            switchTab(targetId);
            window.location.hash = targetId.replace("tab-", "");
        });
    });

    // Soporte para deep-linking con URL hash (#qr, #excel, #divisas, #utils)
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const map = {
            qr: "tab-qr",
            excel: "tab-excel",
            divisas: "tab-divisas",
            utils: "tab-utils"
        };
        if (map[hash]) {
            switchTab(map[hash]);
        }
    }
}

// ==========================================================================
// 2. GENERADOR DE CÓDIGOS QR AVANZADO
// ==========================================================================
function initQRGenerator() {
    let currentType = "url";
    let qrcodeInstance = null;
    const outputContainer = document.getElementById("qr-output-container");
    if (!outputContainer) return;

    // Selector de Tipos (URL, WiFi, vCard, Texto)
    const typeBtns = document.querySelectorAll(".qr-type-btn");
    const formBlocks = {
        url: document.getElementById("qr-form-url"),
        wifi: document.getElementById("qr-form-wifi"),
        vcard: document.getElementById("qr-form-vcard"),
        text: document.getElementById("qr-form-text")
    };

    typeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            typeBtns.forEach((b) => {
                b.classList.remove("active", "border-blue-500", "bg-blue-50", "text-blue-700");
                b.classList.add("border-gray-200", "text-gray-700");
            });
            btn.classList.add("active", "border-blue-500", "bg-blue-50", "text-blue-700");
            btn.classList.remove("border-gray-200", "text-gray-700");

            currentType = btn.getAttribute("data-type");
            Object.keys(formBlocks).forEach((k) => {
                if (formBlocks[k]) {
                    if (k === currentType) {
                        formBlocks[k].classList.remove("hidden");
                    } else {
                        formBlocks[k].classList.add("hidden");
                    }
                }
            });

            generateQR();
            if (window.feather) window.feather.replace();
        });
    });

    // Inputs de color
    const colorFg = document.getElementById("qr-color-fg");
    const colorBg = document.getElementById("qr-color-bg");
    const colorFgText = document.getElementById("qr-color-fg-text");
    const colorBgText = document.getElementById("qr-color-bg-text");
    const selectLevel = document.getElementById("qr-correction-level");
    const selectSize = document.getElementById("qr-size-select");

    colorFg?.addEventListener("input", (e) => {
        if (colorFgText) colorFgText.textContent = e.target.value;
        generateQR();
    });
    colorBg?.addEventListener("input", (e) => {
        if (colorBgText) colorBgText.textContent = e.target.value;
        generateQR();
    });
    selectLevel?.addEventListener("change", generateQR);
    selectSize?.addEventListener("change", generateQR);

    // Escuchadores de inputs de contenido
    const allInputs = [
        document.getElementById("qr-input-url"),
        document.getElementById("qr-wifi-ssid"),
        document.getElementById("qr-wifi-type"),
        document.getElementById("qr-wifi-pass"),
        document.getElementById("qr-wifi-hidden"),
        document.getElementById("qr-vcard-name"),
        document.getElementById("qr-vcard-role"),
        document.getElementById("qr-vcard-phone"),
        document.getElementById("qr-vcard-email"),
        document.getElementById("qr-input-text")
    ];

    allInputs.forEach((inp) => {
        if (!inp) return;
        inp.addEventListener("input", debounce(generateQR, 250));
        inp.addEventListener("change", generateQR);
    });

    // Función constructora de datos según tipo
    function getQRDataString() {
        if (currentType === "url") {
            const url = document.getElementById("qr-input-url")?.value.trim() || "https://minibruno.com";
            return url.startsWith("http://") || url.startsWith("https://") ? url : "https://" + url;
        }

        if (currentType === "wifi") {
            const ssid = document.getElementById("qr-wifi-ssid")?.value.trim() || "MiniBruno_WiFi";
            const type = document.getElementById("qr-wifi-type")?.value || "WPA";
            const pass = document.getElementById("qr-wifi-pass")?.value || "";
            const hidden = document.getElementById("qr-wifi-hidden")?.checked ? "true" : "false";
            return `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;`;
        }

        if (currentType === "vcard") {
            const name = document.getElementById("qr-vcard-name")?.value.trim() || "Colaborador Mini Bruno";
            const role = document.getElementById("qr-vcard-role")?.value.trim() || "Sistemas TI";
            const phone = document.getElementById("qr-vcard-phone")?.value.trim() || "+58 414 4677046";
            const email = document.getElementById("qr-vcard-email")?.value.trim() || "soporte@minibruno.com";
            return [
                "BEGIN:VCARD",
                "VERSION:3.0",
                `N:${name};;;`,
                `FN:${name}`,
                "ORG:Mini Bruno Sucesores C.A.",
                `TITLE:${role}`,
                `TEL;TYPE=CELL,VOICE:${phone}`,
                `EMAIL;TYPE=WORK,INTERNET:${email}`,
                "END:VCARD"
            ].join("\n");
        }

        if (currentType === "text") {
            return document.getElementById("qr-input-text")?.value.trim() || "Mini Bruno Sucesores C.A. - Excelencia Operativa";
        }

        return "https://minibruno.com";
    }

    // Renderizar QR
    function generateQR() {
        const text = getQRDataString();
        const size = parseInt(selectSize?.value || "280", 10);
        const fg = colorFg?.value || "#213379";
        const bg = colorBg?.value || "#ffffff";
        const levelCode = selectLevel?.value || "M";

        let correctLevel = QRCode.CorrectLevel.M;
        if (levelCode === "L") correctLevel = QRCode.CorrectLevel.L;
        if (levelCode === "Q") correctLevel = QRCode.CorrectLevel.Q;
        if (levelCode === "H") correctLevel = QRCode.CorrectLevel.H;

        outputContainer.innerHTML = "";

        try {
            qrcodeInstance = new QRCode(outputContainer, {
                text: text,
                width: size,
                height: size,
                colorDark: fg,
                colorLight: bg,
                correctLevel: correctLevel
            });
        } catch (err) {
            console.error("Error al generar QR:", err);
        }
    }

    // Botón Descargar PNG
    document.getElementById("qr-btn-download-png")?.addEventListener("click", () => {
        const canvas = outputContainer.querySelector("canvas");
        const img = outputContainer.querySelector("img");

        let dataUrl = "";
        if (canvas) {
            dataUrl = canvas.toDataURL("image/png");
        } else if (img && img.src) {
            dataUrl = img.src;
        }

        if (!dataUrl) {
            showToast("No se pudo obtener la imagen del QR", false);
            return;
        }

        const link = document.createElement("a");
        link.download = `QRCode_MiniBruno_${currentType}.png`;
        link.href = dataUrl;
        link.click();
        showToast("Código QR descargado en PNG");
    });

    // Botón Descargar SVG
    document.getElementById("qr-btn-download-svg")?.addEventListener("click", () => {
        const canvas = outputContainer.querySelector("canvas");
        if (!canvas) {
            showToast("Generando SVG...", true);
        }

        // Crear una versión SVG limpia basada en la imagen/canvas
        const img = outputContainer.querySelector("img") || canvas;
        const dataUrl = canvas ? canvas.toDataURL("image/png") : (img?.src || "");

        const size = parseInt(selectSize?.value || "280", 10);
        const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <image width="${size}" height="${size}" xlink:href="${dataUrl}" />
</svg>`;

        const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const link = document.createElement("a");
        link.download = `QRCode_MiniBruno_${currentType}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        showToast("Código QR descargado en formato SVG");
    });

    // Botón Copiar al Portapapeles
    document.getElementById("qr-btn-copy-img")?.addEventListener("click", async () => {
        const canvas = outputContainer.querySelector("canvas");
        if (!canvas) {
            showToast("No se encontró el lienzo del QR para copiar", false);
            return;
        }

        try {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    showToast("Error al procesar imagen del QR", false);
                    return;
                }
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob })
                    ]);
                    showToast("¡Imagen del QR copiada al portapapeles!");
                } catch (clipErr) {
                    // Fallback
                    showToast("Copiado no soportado directamente por el navegador", false);
                }
            }, "image/png");
        } catch (err) {
            console.error("Error al copiar QR:", err);
            showToast("Error al copiar al portapapeles", false);
        }
    });

    // Generación inicial
    generateQR();
}

// ==========================================================================
// 3. CONVERSOR BIDIRECCIONAL EXCEL ⇄ CSV
// ==========================================================================
function initExcelCsvConverter() {
    // 3.1 Selector de modo (Excel a CSV vs CSV a Excel)
    const btnModeXlsxToCsv = document.getElementById("btn-mode-xlsx-to-csv");
    const btnModeCsvToXlsx = document.getElementById("btn-mode-csv-to-xlsx");
    const panelXlsxToCsv = document.getElementById("panel-xlsx-to-csv");
    const panelCsvToXlsx = document.getElementById("panel-csv-to-xlsx");

    btnModeXlsxToCsv?.addEventListener("click", () => {
        btnModeXlsxToCsv.classList.add("active", "bg-white", "text-emerald-700", "shadow-sm");
        btnModeXlsxToCsv.classList.remove("text-gray-600");
        btnModeCsvToXlsx.classList.remove("active", "bg-white", "text-emerald-700", "shadow-sm");
        btnModeCsvToXlsx.classList.add("text-gray-600");

        panelXlsxToCsv?.classList.remove("hidden");
        panelCsvToXlsx?.classList.add("hidden");
    });

    btnModeCsvToXlsx?.addEventListener("click", () => {
        btnModeCsvToXlsx.classList.add("active", "bg-white", "text-emerald-700", "shadow-sm");
        btnModeCsvToXlsx.classList.remove("text-gray-600");
        btnModeXlsxToCsv.classList.remove("active", "bg-white", "text-emerald-700", "shadow-sm");
        btnModeXlsxToCsv.classList.add("text-gray-600");

        panelCsvToXlsx?.classList.remove("hidden");
        panelXlsxToCsv?.classList.add("hidden");
    });

    // 3.2 Lógica Excel a CSV
    const dropZoneXlsx = document.getElementById("drop-zone-xlsx");
    const fileInputXlsx = document.getElementById("file-input-xlsx");
    const xlsxOptionsBox = document.getElementById("xlsx-options-box");
    const sheetSelect = document.getElementById("xlsx-sheet-select");
    const filenameLabel = document.getElementById("xlsx-filename-label");
    const filesizeLabel = document.getElementById("xlsx-filesize-label");
    const previewTableXlsx = document.getElementById("xlsx-preview-table");
    const previewCountXlsx = document.getElementById("xlsx-preview-count");
    const btnDownloadCsv = document.getElementById("btn-download-csv");

    let currentWorkbook = null;
    let currentFileName = "datos.xlsx";

    // Setup drag & drop para XLSX
    setupDropZone(dropZoneXlsx, fileInputXlsx, (file) => {
        handleExcelFile(file);
    });

    function handleExcelFile(file) {
        if (!file) return;
        currentFileName = file.name;
        if (filenameLabel) filenameLabel.textContent = file.name;
        if (filesizeLabel) filesizeLabel.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                currentWorkbook = XLSX.read(data, { type: "array" });

                // Poblar selector de hojas
                if (sheetSelect) {
                    sheetSelect.innerHTML = "";
                    currentWorkbook.SheetNames.forEach((name) => {
                        const opt = document.createElement("option");
                        opt.value = name;
                        opt.textContent = name;
                        sheetSelect.appendChild(opt);
                    });
                }

                xlsxOptionsBox?.classList.remove("hidden");
                renderSheetPreview(currentWorkbook.SheetNames[0]);
                showToast("Archivo Excel cargado exitosamente");
            } catch (err) {
                console.error("Error al procesar Excel:", err);
                showToast("No se pudo leer el archivo Excel", false);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    sheetSelect?.addEventListener("change", (e) => {
        if (currentWorkbook) {
            renderSheetPreview(e.target.value);
        }
    });

    function renderSheetPreview(sheetName) {
        if (!currentWorkbook || !previewTableXlsx) return;
        const worksheet = currentWorkbook.Sheets[sheetName];
        if (!worksheet) return;

        // Convertir a matriz JSON con cabecera en fila 1
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        if (rows.length === 0) {
            previewTableXlsx.innerHTML = "<tr><td class='p-4 text-center text-gray-400'>Hoja de cálculo vacía</td></tr>";
            return;
        }

        const previewRows = rows.slice(0, 8);
        if (previewCountXlsx) previewCountXlsx.textContent = `Mostrando 8 de ${rows.length} filas`;

        let html = "";
        previewRows.forEach((row, rIdx) => {
            const isHeader = rIdx === 0;
            html += `<tr class="${isHeader ? 'bg-gray-100 font-bold text-gray-800' : 'hover:bg-gray-50 border-b border-gray-100'}">`;
            row.forEach((cell) => {
                const tag = isHeader ? "th" : "td";
                html += `<${tag} class="px-3 py-2 border-r border-gray-200 text-xs truncate max-w-[200px]">${escapeHtml(String(cell))}</${tag}>`;
            });
            html += "</tr>";
        });

        previewTableXlsx.innerHTML = html;
    }

    btnDownloadCsv?.addEventListener("click", () => {
        if (!currentWorkbook) {
            showToast("Primero carga un archivo Excel", false);
            return;
        }

        const selectedSheetName = sheetSelect?.value || currentWorkbook.SheetNames[0];
        const worksheet = currentWorkbook.Sheets[selectedSheetName];
        const delimiter = document.getElementById("csv-delimiter-select")?.value || ";";
        const encoding = document.getElementById("csv-encoding-select")?.value || "utf-8-bom";

        // Generar CSV usando SheetJS con el separador solicitado
        const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: delimiter });
        const finalContent = encoding === "utf-8-bom" ? "\uFEFF" + csvContent : csvContent;

        const blob = new Blob([finalContent], { type: "text/csv;charset=utf-8;" });
        const baseName = currentFileName.replace(/\.[^/.]+$/, "");
        const link = document.createElement("a");
        link.download = `${baseName}_${selectedSheetName}.csv`;
        link.href = URL.createObjectURL(blob);
        link.click();

        showToast("Archivo CSV generado y descargado");
    });

    // 3.3 Lógica CSV a Excel
    const dropZoneCsv = document.getElementById("drop-zone-csv");
    const fileInputCsv = document.getElementById("file-input-csv");
    const csvOptionsBox = document.getElementById("csv-options-box");
    const csvFilenameLabel = document.getElementById("csv-filename-label");
    const csvInputDelimiter = document.getElementById("csv-input-delimiter");
    const csvPreviewTable = document.getElementById("csv-preview-table");
    const btnDownloadXlsx = document.getElementById("btn-download-xlsx");

    let currentCsvText = "";
    let currentCsvFileName = "datos.csv";

    setupDropZone(dropZoneCsv, fileInputCsv, (file) => {
        handleCsvFile(file);
    });

    function handleCsvFile(file) {
        if (!file) return;
        currentCsvFileName = file.name;
        if (csvFilenameLabel) csvFilenameLabel.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            currentCsvText = e.target.result;
            csvOptionsBox?.classList.remove("hidden");
            renderCsvPreview();
            showToast("Archivo CSV cargado exitosamente");
        };
        reader.readAsText(file, "UTF-8");
    }

    csvInputDelimiter?.addEventListener("change", renderCsvPreview);

    function detectDelimiter(text) {
        const firstLine = text.split("\n")[0] || "";
        const counts = {
            ";": (firstLine.match(/;/g) || []).length,
            ",": (firstLine.match(/,/g) || []).length,
            "\t": (firstLine.match(/\t/g) || []).length,
            "|": (firstLine.match(/\|/g) || []).length
        };
        let best = ";";
        let max = -1;
        Object.keys(counts).forEach((k) => {
            if (counts[k] > max) {
                max = counts[k];
                best = k;
            }
        });
        return best;
    }

    function renderCsvPreview() {
        if (!currentCsvText || !csvPreviewTable) return;
        let delimiter = csvInputDelimiter?.value || "auto";
        if (delimiter === "auto") {
            delimiter = detectDelimiter(currentCsvText);
        }

        const lines = currentCsvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        const previewLines = lines.slice(0, 8);

        let html = "";
        previewLines.forEach((line, idx) => {
            const cols = line.split(delimiter);
            const isHeader = idx === 0;
            html += `<tr class="${isHeader ? 'bg-blue-50 font-bold text-gray-800' : 'hover:bg-gray-50 border-b border-gray-100'}">`;
            cols.forEach((col) => {
                const tag = isHeader ? "th" : "td";
                html += `<${tag} class="px-3 py-2 border-r border-gray-200 text-xs truncate max-w-[200px]">${escapeHtml(col.replace(/^["']|["']$/g, ""))}</${tag}>`;
            });
            html += "</tr>";
        });

        csvPreviewTable.innerHTML = html;
    }

    btnDownloadXlsx?.addEventListener("click", () => {
        if (!currentCsvText) {
            showToast("Primero carga un archivo CSV", false);
            return;
        }

        let delimiter = csvInputDelimiter?.value || "auto";
        if (delimiter === "auto") {
            delimiter = detectDelimiter(currentCsvText);
        }

        try {
            // Leer el CSV como workbook SheetJS
            const workbook = XLSX.read(currentCsvText, { type: "string", FS: delimiter, raw: true });
            const targetSheetName = document.getElementById("xlsx-target-sheetname")?.value.trim() || "Datos";
            
            // Renombrar primera hoja si aplica
            const origSheetName = workbook.SheetNames[0];
            if (origSheetName && origSheetName !== targetSheetName) {
                workbook.Sheets[targetSheetName] = workbook.Sheets[origSheetName];
                delete workbook.Sheets[origSheetName];
                workbook.SheetNames[0] = targetSheetName;
            }

            const baseName = currentCsvFileName.replace(/\.[^/.]+$/, "");
            XLSX.writeFile(workbook, `${baseName}_convertido.xlsx`);
            showToast("Hoja de cálculo Excel (.xlsx) generada");
        } catch (err) {
            console.error("Error al exportar a Excel:", err);
            showToast("Error al convertir CSV a Excel", false);
        }
    });
}

// Helper para configurar drag & drop
function setupDropZone(dropZone, fileInput, onFileSelected) {
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelected(e.target.files[0]);
        }
    });

    ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files[0]) {
            onFileSelected(dt.files[0]);
        }
    });
}

// ==========================================================================
// 4. MONITOR DE DIVISAS VENEZUELA (BCV USD, Euro y USDT)
// ==========================================================================
function initCurrencyMonitor() {
    // Tasas iniciales de respaldo confiables (en caso de fallo de red / modo offline)
    let rates = {
        bcv_usd: 859.06,
        bcv_eur: 973.31,
        usdt: 954.55
    };

    const elBcvUsd = document.getElementById("rate-bcv-usd");
    const elBcvEur = document.getElementById("rate-bcv-eur");
    const elUsdt = document.getElementById("rate-usdt");
    const elLastUpdate = document.getElementById("rates-last-update");
    const btnRefresh = document.getElementById("btn-refresh-rates");

    async function fetchRates() {
        if (elLastUpdate) elLastUpdate.textContent = "Sincronizando tasas en vivo...";
        let updated = false;

        try {
            // 1. Obtener Dólares (Oficial BCV y Paralelo/USDT)
            const resUsd = await fetch("https://ve.dolarapi.com/v1/dolares");
            if (resUsd.ok) {
                const dataUsd = await resUsd.json();
                const oficial = dataUsd.find((d) => d.fuente === "oficial");
                const paralelo = dataUsd.find((d) => d.fuente === "paralelo");

                if (oficial && oficial.promedio) {
                    rates.bcv_usd = Number(oficial.promedio);
                    updated = true;
                }
                if (paralelo && paralelo.promedio) {
                    rates.usdt = Number(paralelo.promedio);
                    updated = true;
                }
            }

            // 2. Obtener Euros (Oficial BCV)
            const resEur = await fetch("https://ve.dolarapi.com/v1/euros");
            if (resEur.ok) {
                const dataEur = await resEur.json();
                const oficialEur = dataEur.find((d) => d.fuente === "oficial");
                if (oficialEur && oficialEur.promedio) {
                    rates.bcv_eur = Number(oficialEur.promedio);
                    updated = true;
                }
            }
        } catch (err) {
            console.warn("MonitorDivisas: Usando cotizaciones de respaldo:", err);
        }

        renderRates();
        updateCalculations();

        const now = new Date();
        const timeStr = now.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
        if (elLastUpdate) {
            elLastUpdate.textContent = updated
                ? `Actualizado hoy a las ${timeStr} (BCV / DolarApi)`
                : `Tasas de referencia activas (Modo contingencia)`;
        }
    }

    function formatBs(val) {
        return Number(val).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function renderRates() {
        if (elBcvUsd) elBcvUsd.textContent = formatBs(rates.bcv_usd);
        if (elBcvEur) elBcvEur.textContent = formatBs(rates.bcv_eur);
        if (elUsdt) elUsdt.textContent = formatBs(rates.usdt);
    }

    // Calculadora Bidireccional
    const inputVes = document.getElementById("calc-ves-input");
    const resBcvUsd = document.getElementById("calc-res-bcv-usd");
    const resBcvEur = document.getElementById("calc-res-bcv-eur");
    const resUsdt = document.getElementById("calc-res-usdt");

    const inputFx = document.getElementById("calc-fx-input");
    const currencyType = document.getElementById("calc-currency-type");
    const currencySymbol = document.getElementById("calc-currency-symbol");
    const resVes = document.getElementById("calc-res-ves");
    const btnCopyVes = document.getElementById("btn-copy-calc-ves");

    function updateCalculations() {
        // A: VES a Divisas
        const vesAmount = parseFloat(inputVes?.value || "0") || 0;
        if (resBcvUsd) resBcvUsd.textContent = `$ ${(vesAmount / rates.bcv_usd).toFixed(2)}`;
        if (resBcvEur) resBcvEur.textContent = `€ ${(vesAmount / rates.bcv_eur).toFixed(2)}`;
        if (resUsdt) resUsdt.textContent = `${(vesAmount / rates.usdt).toFixed(2)} USDT`;

        // B: Divisa a VES
        const fxAmount = parseFloat(inputFx?.value || "0") || 0;
        const selectedType = currencyType?.value || "usd_bcv";
        let activeRate = rates.bcv_usd;

        if (selectedType === "usd_bcv") {
            activeRate = rates.bcv_usd;
            if (currencySymbol) currencySymbol.textContent = "$";
        } else if (selectedType === "eur_bcv") {
            activeRate = rates.bcv_eur;
            if (currencySymbol) currencySymbol.textContent = "€";
        } else if (selectedType === "usdt") {
            activeRate = rates.usdt;
            if (currencySymbol) currencySymbol.textContent = "₮";
        }

        const calculatedVes = fxAmount * activeRate;
        if (resVes) resVes.textContent = `Bs. ${formatBs(calculatedVes)}`;
    }

    inputVes?.addEventListener("input", updateCalculations);
    inputFx?.addEventListener("input", updateCalculations);
    currencyType?.addEventListener("change", updateCalculations);

    btnRefresh?.addEventListener("click", async () => {
        btnRefresh.classList.add("animate-spin");
        await fetchRates();
        setTimeout(() => {
            btnRefresh.classList.remove("animate-spin");
            showToast("Tasas de cambio actualizadas");
        }, 400);
    });

    btnCopyVes?.addEventListener("click", () => {
        const text = resVes?.textContent || "";
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Copiado: ${text}`);
        });
    });

    // Carga inicial de tasas
    fetchRates();
}

// ==========================================================================
// 5. UTILIDADES TI & OFIMÁTICA
// ==========================================================================

// 5.1 Generador de Contraseñas Fuertes
function initPasswordGenerator() {
    const output = document.getElementById("pwd-output");
    const slider = document.getElementById("pwd-length-slider");
    const lengthLabel = document.getElementById("pwd-length-label");
    const strengthLabel = document.getElementById("pwd-strength-label");
    const strengthBar = document.getElementById("pwd-strength-bar");

    const optUpper = document.getElementById("pwd-opt-upper");
    const optLower = document.getElementById("pwd-opt-lower");
    const optNumbers = document.getElementById("pwd-opt-numbers");
    const optSymbols = document.getElementById("pwd-opt-symbols");

    const btnGenerate = document.getElementById("pwd-btn-generate");
    const btnCopy = document.getElementById("pwd-btn-copy");

    const charSets = {
        upper: "ABCDEFGHJKLMNPQRSTUVWXYZ", // sin caracteres ambiguos comunes
        lower: "abcdefghijkmnopqrstuvwxyz",
        numbers: "23456789",
        symbols: "!@#$%&*-_=+"
    };

    function generatePassword() {
        const len = parseInt(slider?.value || "16", 10);
        if (lengthLabel) lengthLabel.textContent = `${len} caracteres`;

        let pool = "";
        let guaranteed = [];

        if (optUpper?.checked) {
            pool += charSets.upper;
            guaranteed.push(charSets.upper[Math.floor(Math.random() * charSets.upper.length)]);
        }
        if (optLower?.checked) {
            pool += charSets.lower;
            guaranteed.push(charSets.lower[Math.floor(Math.random() * charSets.lower.length)]);
        }
        if (optNumbers?.checked) {
            pool += charSets.numbers;
            guaranteed.push(charSets.numbers[Math.floor(Math.random() * charSets.numbers.length)]);
        }
        if (optSymbols?.checked) {
            pool += charSets.symbols;
            guaranteed.push(charSets.symbols[Math.floor(Math.random() * charSets.symbols.length)]);
        }

        if (pool.length === 0) {
            pool = charSets.lower + charSets.numbers;
        }

        const remaining = len - guaranteed.length;
        const randomValues = new Uint32Array(remaining);
        window.crypto.getRandomValues(randomValues);

        let resultChars = [...guaranteed];
        for (let i = 0; i < remaining; i++) {
            resultChars.push(pool[randomValues[i] % pool.length]);
        }

        // Mezclar caracteres
        resultChars = resultChars.sort(() => Math.random() - 0.5);
        const finalPwd = resultChars.join("");

        if (output) output.value = finalPwd;
        updateStrengthMeter(finalPwd, pool.length);
    }

    function updateStrengthMeter(pwd, poolSize) {
        if (!strengthLabel || !strengthBar) return;
        const len = pwd.length;

        if (len < 10) {
            strengthLabel.textContent = "Débil";
            strengthLabel.className = "font-bold text-rose-500";
            strengthBar.className = "bg-rose-500 h-full w-1/4 transition-all";
        } else if (len < 14) {
            strengthLabel.textContent = "Aceptable";
            strengthLabel.className = "font-bold text-amber-500";
            strengthBar.className = "bg-amber-500 h-full w-2/4 transition-all";
        } else if (len < 20) {
            strengthLabel.textContent = "Muy Fuerte";
            strengthLabel.className = "font-bold text-emerald-500";
            strengthBar.className = "bg-emerald-500 h-full w-3/4 transition-all";
        } else {
            strengthLabel.textContent = "Máxima / Blindada";
            strengthLabel.className = "font-bold text-purple-600";
            strengthBar.className = "bg-purple-600 h-full w-full transition-all";
        }
    }

    slider?.addEventListener("input", generatePassword);
    [optUpper, optLower, optNumbers, optSymbols].forEach((opt) => opt?.addEventListener("change", generatePassword));
    btnGenerate?.addEventListener("click", generatePassword);

    btnCopy?.addEventListener("click", () => {
        if (!output || !output.value) return;
        navigator.clipboard.writeText(output.value).then(() => {
            showToast("Contraseña copiada al portapapeles");
        });
    });

    generatePassword();
}

// 5.2 Calculadora de Redes y Subredes IPv4 (CIDR)
function initCidrCalculator() {
    const ipInput = document.getElementById("cidr-ip-input");
    const maskSelect = document.getElementById("cidr-mask-select");

    const resNetwork = document.getElementById("cidr-res-network");
    const resGateway = document.getElementById("cidr-res-gateway");
    const resBroadcast = document.getElementById("cidr-res-broadcast");
    const resRange = document.getElementById("cidr-res-range");
    const resHosts = document.getElementById("cidr-res-hosts");
    const resType = document.getElementById("cidr-res-type");
    const resClass = document.getElementById("cidr-res-class");

    function ipToInt(ip) {
        return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    function intToIp(int) {
        return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join(".");
    }

    function calculateCIDR() {
        const rawIp = (ipInput?.value || "").trim();
        const cidr = parseInt(maskSelect?.value || "24", 10);

        // Validar formato IPv4
        const octets = rawIp.split(".");
        if (octets.length !== 4 || octets.some((o) => isNaN(o) || parseInt(o, 10) < 0 || parseInt(o, 10) > 255)) {
            return;
        }

        const ipNum = ipToInt(rawIp);
        const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
        const networkNum = (ipNum & maskNum) >>> 0;
        const broadcastNum = (networkNum | ~maskNum) >>> 0;

        const firstHostNum = cidr >= 31 ? networkNum : networkNum + 1;
        const lastHostNum = cidr >= 31 ? broadcastNum : broadcastNum - 1;
        const totalHosts = cidr >= 31 ? 0 : Math.max(0, Math.pow(2, 32 - cidr) - 2);

        if (resNetwork) resNetwork.textContent = intToIp(networkNum);
        if (resGateway) resGateway.textContent = intToIp(firstHostNum);
        if (resBroadcast) resBroadcast.textContent = intToIp(broadcastNum);
        if (resRange) resRange.textContent = `${intToIp(firstHostNum)} - ${intToIp(lastHostNum)}`;
        if (resHosts) resHosts.textContent = `${totalHosts.toLocaleString()} direcciones`;

        // Tipo de red (Privada RFC 1918 vs Pública)
        const firstOctet = parseInt(octets[0], 10);
        const secondOctet = parseInt(octets[1], 10);

        let isPrivate = false;
        if (firstOctet === 10) isPrivate = true;
        if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) isPrivate = true;
        if (firstOctet === 192 && secondOctet === 168) isPrivate = true;
        if (firstOctet === 127) isPrivate = true;

        if (resType) {
            resType.textContent = isPrivate ? "Red Privada (RFC 1918)" : "Dirección IP Pública";
            resType.className = isPrivate
                ? "px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold"
                : "px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono font-bold";
        }

        // Clase de red
        let networkClass = "Clase C";
        if (firstOctet < 128) networkClass = "Clase A";
        else if (firstOctet < 192) networkClass = "Clase B";
        else if (firstOctet < 224) networkClass = "Clase C";
        else networkClass = "Clase D / Multicast";

        if (resClass) resClass.textContent = networkClass;
    }

    ipInput?.addEventListener("input", calculateCIDR);
    maskSelect?.addEventListener("change", calculateCIDR);

    calculateCIDR();
}

// 5.3 Sanitizador y Formateador de Texto
function initTextSanitizer() {
    const textarea = document.getElementById("text-sanitize-input");
    const cntChars = document.getElementById("cnt-chars");
    const cntWords = document.getElementById("cnt-words");
    const cntLines = document.getElementById("cnt-lines");
    const cntSpaces = document.getElementById("cnt-spaces");

    const actionBtns = document.querySelectorAll(".btn-text-action");
    const btnCopy = document.getElementById("btn-copy-sanitized");
    const btnClear = document.getElementById("btn-clear-sanitized");

    function updateStats() {
        const text = textarea?.value || "";
        if (cntChars) cntChars.textContent = text.length;
        if (cntSpaces) cntSpaces.textContent = text.replace(/\s/g, "").length;

        const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
        if (cntWords) cntWords.textContent = words;

        const lines = text.length > 0 ? text.split("\n").length : 0;
        if (cntLines) cntLines.textContent = lines;
    }

    actionBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!textarea) return;
            const action = btn.getAttribute("data-action");
            let str = textarea.value;

            if (action === "upper") {
                str = str.toUpperCase();
            } else if (action === "lower") {
                str = str.toLowerCase();
            } else if (action === "title") {
                str = str.replace(/\b\w/g, (c) => c.toUpperCase());
            } else if (action === "clean-spaces") {
                str = str
                    .split("\n")
                    .map((l) => l.replace(/[ \t]+/g, " ").trim())
                    .join("\n");
            } else if (action === "clean-lines") {
                str = str
                    .split("\n")
                    .filter((l) => l.trim().length > 0)
                    .join("\n");
            } else if (action === "slug") {
                str = str
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
            }

            textarea.value = str;
            updateStats();
            showToast("Texto transformado");
        });
    });

    textarea?.addEventListener("input", updateStats);

    btnCopy?.addEventListener("click", () => {
        if (!textarea || !textarea.value) return;
        navigator.clipboard.writeText(textarea.value).then(() => {
            showToast("Texto copiado al portapapeles");
        });
    });

    btnClear?.addEventListener("click", () => {
        if (!textarea) return;
        textarea.value = "";
        updateStats();
        showToast("Área de texto limpiada");
    });

    updateStats();
}

// Helper Debounce
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Helper Escape HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
