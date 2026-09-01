/**
 * PDF Image Formatter — Core Application Logic
 * Native HTML/CSS/Vanilla JS (100% Client-Side)
 * Feature: Manual Multi-Sheet Management (Tambah Kertas Baru)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Application State
  // ==========================================
  const state = {
    activeSheetId: 'sheet_1',
    sheets: [
      {
        id: 'sheet_1',
        dateText: '1 AGUSTUS 2026',
        images: []
      }
    ],
    gridCols: 3,
    paperSize: 'a4-landscape'
  };

  // SortableJS Instance
  let sortableInstance = null;

  // ==========================================
  // 2. DOM Elements
  // ==========================================
  const addSheetBtnHeader = document.getElementById('addSheetBtnHeader');
  const sheetTabsContainer = document.getElementById('sheetTabsContainer');
  const activeSheetTitleLabel = document.getElementById('activeSheetTitleLabel');

  const dateInput = document.getElementById('dateInput');
  const todayPresetBtn = document.getElementById('todayPresetBtn');
  const uppercaseBtn = document.getElementById('uppercaseBtn');
  const applyAllDatesBtn = document.getElementById('applyAllDatesBtn');

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  const thumbnailList = document.getElementById('thumbnailList');
  const emptyState = document.getElementById('emptyState');
  const imageCountBadge = document.getElementById('imageCount');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const gridColsSelect = document.getElementById('gridColsSelect');
  const paperSizeSelect = document.getElementById('paperSizeSelect');
  const generatePdfBtn = document.getElementById('generatePdfBtn');

  const previewSheetsContainer = document.getElementById('previewSheetsContainer');
  const sheetsCountTag = document.getElementById('sheetsCountTag');
  const aspectTag = document.getElementById('aspectTag');
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================
  // 3. Helper Functions
  // ==========================================
  function getActiveSheet() {
    let sheet = state.sheets.find(s => s.id === state.activeSheetId);
    if (!sheet && state.sheets.length > 0) {
      sheet = state.sheets[0];
      state.activeSheetId = sheet.id;
    }
    return sheet;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function sanitizeFilename(name) {
    return name
      .trim()
      .replace(/[\s\/\:\*\?\"\<\>\|]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'Dokumentasi-Gambar';
  }

  function getIndonesianDateString(dateObj = new Date()) {
    const months = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // Compress & Resize Image Client-side via Canvas
  function compressImage(file, maxDimension = 1400, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(mimeType, quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ==========================================
  // 4. Sheet Management (Tambah Kertas)
  // ==========================================
  function addNewSheet() {
    const sheetNum = state.sheets.length + 1;
    const lastDate = getActiveSheet() ? getActiveSheet().dateText : '1 AGUSTUS 2026';
    const newSheet = {
      id: 'sheet_' + Date.now(),
      dateText: lastDate,
      images: []
    };

    state.sheets.push(newSheet);
    state.activeSheetId = newSheet.id;
    renderUI();
    showToast(`Kertas ${sheetNum} berhasil ditambahkan!`);
  }

  function removeSheet(sheetId, e) {
    if (e) e.stopPropagation();

    if (state.sheets.length <= 1) {
      showToast('Minimal harus ada 1 Kertas.', 'error');
      return;
    }

    const indexToRemove = state.sheets.findIndex(s => s.id === sheetId);
    if (indexToRemove === -1) return;

    state.sheets.splice(indexToRemove, 1);

    if (state.activeSheetId === sheetId) {
      const newActiveIdx = Math.max(0, indexToRemove - 1);
      state.activeSheetId = state.sheets[newActiveIdx].id;
    }

    renderUI();
    showToast('Kertas berhasil dihapus.', 'error');
  }

  function applyDateToAllSheets() {
    const currentActiveDate = dateInput.value;
    state.sheets.forEach(sheet => {
      sheet.dateText = currentActiveDate;
    });
    renderUI();
    showToast('Tanggal disamakan ke semua kertas.');
  }

  // ==========================================
  // 5. File Upload & Processing
  // ==========================================
  async function handleFiles(files) {
    const activeSheet = getActiveSheet();
    if (!activeSheet) return;

    const validFiles = Array.from(files).filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (validFiles.length === 0) {
      showToast('Pilih file gambar berformat JPG, PNG, atau WEBP.', 'error');
      return;
    }

    let addedCount = 0;
    for (const file of validFiles) {
      try {
        const optimizedDataUrl = await compressImage(file);
        const newImgObj = {
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          name: file.name,
          sizeFormatted: formatFileSize(file.size),
          dataUrl: optimizedDataUrl
        };
        activeSheet.images.push(newImgObj);
        addedCount++;
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    if (addedCount > 0) {
      showToast(`Ditambahkan ${addedCount} gambar ke ${activeSheetTitleLabel.textContent}.`);
      renderUI();
    }
  }

  // Event Listeners for File Input & Dropzone
  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      fileInput.value = '';
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleFiles(dt.files);
    }
  });

  // ==========================================
  // 6. Reordering & SortableJS
  // ==========================================
  function initSortable() {
    if (sortableInstance) {
      sortableInstance.destroy();
    }

    const activeSheet = getActiveSheet();

    sortableInstance = new Sortable(thumbnailList, {
      animation: 180,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: function () {
        const itemElements = thumbnailList.querySelectorAll('.thumb-item');
        const newImagesArray = [];

        itemElements.forEach(el => {
          const imgId = el.getAttribute('data-id');
          const found = activeSheet.images.find(img => img.id === imgId);
          if (found) {
            newImagesArray.push(found);
          }
        });

        activeSheet.images = newImagesArray;
        renderPreviewGrid();
      }
    });
  }

  // ==========================================
  // 7. UI Render Functions
  // ==========================================
  function renderUI() {
    renderSheetTabs();
    renderActiveSheetControls();
    renderPreviewGrid();
  }

  function renderSheetTabs() {
    sheetTabsContainer.innerHTML = '';

    state.sheets.forEach((sheet, idx) => {
      const isSelected = sheet.id === state.activeSheetId;
      const tabEl = document.createElement('div');
      tabEl.className = `sheet-tab-item ${isSelected ? 'active' : ''}`;
      
      const dateDisplay = sheet.dateText.trim() || 'TANGGAL BELUM DIISI';

      tabEl.innerHTML = `
        <div class="sheet-tab-info">
          <span class="sheet-tab-badge">${idx + 1}</span>
          <div class="sheet-tab-text">
            <span class="sheet-tab-title">Kertas ${idx + 1} — ${escapeHtml(dateDisplay)}</span>
            <span class="sheet-tab-sub">${sheet.images.length} Gambar</span>
          </div>
        </div>
        ${state.sheets.length > 1 ? `
          <button type="button" class="btn-remove-sheet" title="Hapus Kertas Ini">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        ` : ''}
      `;

      tabEl.addEventListener('click', () => {
        state.activeSheetId = sheet.id;
        renderUI();
      });

      const removeBtn = tabEl.querySelector('.btn-remove-sheet');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => removeSheet(sheet.id, e));
      }

      sheetTabsContainer.appendChild(tabEl);
    });
  }

  function renderActiveSheetControls() {
    const activeSheet = getActiveSheet();
    const sheetIdx = state.sheets.findIndex(s => s.id === state.activeSheetId) + 1;

    activeSheetTitleLabel.textContent = `Judul Tanggal Kertas ${sheetIdx}`;
    dateInput.value = activeSheet.dateText;

    renderThumbnailList(activeSheet);
  }

  function renderThumbnailList(activeSheet) {
    thumbnailList.innerHTML = '';

    if (activeSheet.images.length === 0) {
      emptyState.style.display = 'flex';
      clearAllBtn.style.display = 'none';
      imageCountBadge.textContent = '0 Gambar';
      return;
    }

    emptyState.style.display = 'none';
    clearAllBtn.style.display = 'flex';
    imageCountBadge.textContent = `${activeSheet.images.length} Gambar`;

    activeSheet.images.forEach((img, idx) => {
      const li = document.createElement('li');
      li.className = 'thumb-item';
      li.setAttribute('data-id', img.id);

      li.innerHTML = `
        <div class="drag-handle" title="Geser untuk mengatur urutan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="8" y1="18" x2="16" y2="18"/>
          </svg>
        </div>
        <img class="thumb-img" src="${img.dataUrl}" alt="Thumbnail ${idx + 1}">
        <div class="thumb-info">
          <div class="thumb-name">#${idx + 1} ${escapeHtml(img.name)}</div>
          <div class="thumb-meta">${img.sizeFormatted}</div>
        </div>
        <button type="button" class="btn-remove-thumb" data-id="${img.id}" title="Hapus gambar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;

      thumbnailList.appendChild(li);
    });

    const removeBtns = thumbnailList.querySelectorAll('.btn-remove-thumb');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idToRemove = btn.getAttribute('data-id');
        activeSheet.images = activeSheet.images.filter(img => img.id !== idToRemove);
        renderUI();
        showToast('Gambar dihapus.', 'error');
      });
    });

    initSortable();
  }

  function renderPreviewGrid() {
    const isLandscape = state.paperSize === 'a4-landscape';
    aspectTag.textContent = isLandscape ? 'A4 Landscape' : 'A4 Portrait';

    const totalSheets = state.sheets.length;
    sheetsCountTag.textContent = `${totalSheets} Sheet${totalSheets > 1 ? 's' : ''}`;

    previewSheetsContainer.innerHTML = '';

    state.sheets.forEach((sheet, pageIndex) => {
      const isSelected = sheet.id === state.activeSheetId;
      const sheetEl = document.createElement('div');
      sheetEl.className = `a4-sheet ${isLandscape ? 'landscape' : ''} ${isSelected ? 'active-sheet-preview' : ''}`;
      sheetEl.setAttribute('data-sheet-id', sheet.id);

      const headerTitleText = sheet.dateText.trim() || 'TANGGAL DOKUMENTASI';

      let sheetHtml = `
        <header class="pdf-header">
          <h1 class="pdf-title-date">${escapeHtml(headerTitleText)}</h1>
          <div class="pdf-header-divider"></div>
        </header>
        <div class="pdf-image-grid cols-${state.gridCols}">
      `;

      if (sheet.images.length === 0) {
        sheetHtml += `
          <div class="preview-placeholder-grid">
            <div class="ph-box"><span class="ph-label">Gambar 1</span></div>
            <div class="ph-box"><span class="ph-label">Gambar 2</span></div>
            <div class="ph-box"><span class="ph-label">Gambar 3</span></div>
          </div>
        `;
      } else {
        sheet.images.forEach((img, idx) => {
          sheetHtml += `
            <div class="pdf-img-card">
              <img src="${img.dataUrl}" alt="Gambar ${idx + 1}">
            </div>
          `;
        });
      }

      sheetHtml += `
        </div>
      `;

      sheetEl.innerHTML = sheetHtml;

      // Click preview sheet to activate it
      sheetEl.addEventListener('click', () => {
        if (state.activeSheetId !== sheet.id) {
          state.activeSheetId = sheet.id;
          renderUI();
        }
      });

      previewSheetsContainer.appendChild(sheetEl);
    });
  }

  // ==========================================
  // 8. Event Listeners & Actions
  // ==========================================
  addSheetBtnHeader.addEventListener('click', addNewSheet);

  dateInput.addEventListener('input', () => {
    const activeSheet = getActiveSheet();
    if (activeSheet) {
      activeSheet.dateText = dateInput.value;
      renderSheetTabs();
      renderPreviewGrid();
    }
  });

  todayPresetBtn.addEventListener('click', () => {
    const activeSheet = getActiveSheet();
    if (activeSheet) {
      dateInput.value = getIndonesianDateString();
      activeSheet.dateText = dateInput.value;
      renderSheetTabs();
      renderPreviewGrid();
      showToast('Tanggal diubah ke hari ini.');
    }
  });

  uppercaseBtn.addEventListener('click', () => {
    const activeSheet = getActiveSheet();
    if (activeSheet) {
      dateInput.value = dateInput.value.toUpperCase();
      activeSheet.dateText = dateInput.value;
      renderSheetTabs();
      renderPreviewGrid();
    }
  });

  applyAllDatesBtn.addEventListener('click', applyDateToAllSheets);

  clearAllBtn.addEventListener('click', () => {
    const activeSheet = getActiveSheet();
    if (activeSheet && confirm('Apakah Anda yakin ingin menghapus semua gambar di Kertas ini?')) {
      activeSheet.images = [];
      renderUI();
      showToast('Semua gambar di Kertas ini dihapus.', 'error');
    }
  });

  gridColsSelect.addEventListener('change', (e) => {
    state.gridCols = parseInt(e.target.value, 10) || 3;
    renderPreviewGrid();
  });

  paperSizeSelect.addEventListener('change', (e) => {
    state.paperSize = e.target.value;
    renderPreviewGrid();
  });

  // ==========================================
  // 9. Generate & Download PDF
  // ==========================================
  async function generatePDF() {
    const totalImages = state.sheets.reduce((acc, s) => acc + s.images.length, 0);
    if (totalImages === 0) {
      showToast('Upload minimal 1 gambar terlebih dahulu!', 'error');
      return;
    }

    const btnText = generatePdfBtn.querySelector('.btn-text');
    const btnLoader = generatePdfBtn.querySelector('.btn-loader');
    generatePdfBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    try {
      const { jsPDF } = window.jspdf;
      const isLandscape = state.paperSize === 'a4-landscape';
      
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const sheetElements = previewSheetsContainer.querySelectorAll('.a4-sheet');
      
      for (let i = 0; i < sheetElements.length; i++) {
        const sheetEl = sheetElements[i];

        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(sheetEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      const activeSheet = getActiveSheet();
      const dateStr = activeSheet ? activeSheet.dateText : 'Dokumentasi-Gambar';
      const filename = `${sanitizeFilename(dateStr)}.pdf`;
      pdf.save(filename);

      showToast(`PDF ${filename} (${sheetElements.length} sheet) berhasil dibuat & didownload!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Gagal membuat PDF. Silakan coba lagi.', 'error');
    } finally {
      generatePdfBtn.disabled = false;
      btnText.style.display = 'flex';
      btnLoader.style.display = 'none';
    }
  }

  generatePdfBtn.addEventListener('click', generatePDF);

  // Initial Render Setup
  renderUI();
});
