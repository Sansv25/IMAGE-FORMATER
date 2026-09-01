/**
 * PDF Image Formatter — Core Application Logic
 * Native HTML/CSS/Vanilla JS (100% Client-Side)
 * Supports Multi-Sheet Pagination & Horizontal (Landscape) Layout
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Application State
  // ==========================================
  const state = {
    dateText: '1 AGUSTUS 2026',
    images: [], // Array of { id, name, sizeFormatted, dataUrl }
    gridCols: 3,
    paperSize: 'a4-landscape', // Default Horizontal
    imagesPerSheet: 6 // Default 6 images per sheet
  };

  // SortableJS Instance
  let sortableInstance = null;

  // ==========================================
  // 2. DOM Elements
  // ==========================================
  const dateInput = document.getElementById('dateInput');
  const todayPresetBtn = document.getElementById('todayPresetBtn');
  const uppercaseBtn = document.getElementById('uppercaseBtn');

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  const thumbnailList = document.getElementById('thumbnailList');
  const emptyState = document.getElementById('emptyState');
  const imageCountBadge = document.getElementById('imageCount');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const gridColsSelect = document.getElementById('gridColsSelect');
  const paperSizeSelect = document.getElementById('paperSizeSelect');
  const imagesPerSheetSelect = document.getElementById('imagesPerSheetSelect');
  const generatePdfBtn = document.getElementById('generatePdfBtn');

  const previewSheetsContainer = document.getElementById('previewSheetsContainer');
  const sheetsCountTag = document.getElementById('sheetsCountTag');
  const aspectTag = document.getElementById('aspectTag');
  const toastContainer = document.getElementById('toastContainer');

  // Set initial input value
  dateInput.value = state.dateText;

  // ==========================================
  // 3. Helper Functions
  // ==========================================
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

  // Optimize & Resize Image Client-side via Canvas
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

          // Return Data URL
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
  // 4. File Upload & Processing
  // ==========================================
  async function handleFiles(files) {
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
        state.images.push(newImgObj);
        addedCount++;
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    if (addedCount > 0) {
      showToast(`Berhasil menambahkan ${addedCount} gambar.`);
      renderUI();
    }
  }

  // Event Listeners for File Input & Dropzone
  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      fileInput.value = ''; // Reset input
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
  // 5. Reordering & SortableJS
  // ==========================================
  function initSortable() {
    if (sortableInstance) {
      sortableInstance.destroy();
    }

    sortableInstance = new Sortable(thumbnailList, {
      animation: 180,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: function () {
        // Synchronize JS state array with DOM order
        const itemElements = thumbnailList.querySelectorAll('.thumb-item');
        const newImagesArray = [];

        itemElements.forEach(el => {
          const imgId = el.getAttribute('data-id');
          const found = state.images.find(img => img.id === imgId);
          if (found) {
            newImagesArray.push(found);
          }
        });

        state.images = newImagesArray;
        renderPreviewGrid(); // Update preview sheets without rebuilding list
      }
    });
  }

  // ==========================================
  // 6. UI Render Functions
  // ==========================================
  function renderUI() {
    renderThumbnailList();
    renderPreviewGrid();
  }

  function renderThumbnailList() {
    thumbnailList.innerHTML = '';

    if (state.images.length === 0) {
      emptyState.style.display = 'flex';
      clearAllBtn.style.display = 'none';
      imageCountBadge.textContent = '0 Gambar';
      return;
    }

    emptyState.style.display = 'none';
    clearAllBtn.style.display = 'flex';
    imageCountBadge.textContent = `${state.images.length} Gambar`;

    state.images.forEach((img, idx) => {
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

    // Attach Remove Button Event Listeners
    const removeBtns = thumbnailList.querySelectorAll('.btn-remove-thumb');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idToRemove = btn.getAttribute('data-id');
        state.images = state.images.filter(img => img.id !== idToRemove);
        renderUI();
        showToast('Gambar dihapus.', 'error');
      });
    });

    initSortable();
  }

  // Render Multi-sheet A4 Preview Container
  function renderPreviewGrid() {
    state.dateText = dateInput.value;
    const headerTitleText = state.dateText.trim() || 'TANGGAL DOKUMENTASI';
    const isLandscape = state.paperSize === 'a4-landscape';

    aspectTag.textContent = isLandscape ? 'A4 Landscape' : 'A4 Portrait';

    previewSheetsContainer.innerHTML = '';

    // Empty state placeholder sheet
    if (state.images.length === 0) {
      sheetsCountTag.textContent = '1 Sheet';

      const sheet = document.createElement('div');
      sheet.className = `a4-sheet ${isLandscape ? 'landscape' : ''}`;
      sheet.innerHTML = `
        <header class="pdf-header">
          <h1 class="pdf-title-date">${escapeHtml(headerTitleText)}</h1>
          <div class="pdf-header-divider"></div>
        </header>
        <div class="pdf-image-grid cols-${state.gridCols}">
          <div class="preview-placeholder-grid">
            <div class="ph-box"><span class="ph-label">Gambar 1</span></div>
            <div class="ph-box"><span class="ph-label">Gambar 2</span></div>
            <div class="ph-box"><span class="ph-label">Gambar 3</span></div>
          </div>
        </div>
        <footer class="pdf-page-footer">
          <span>DOKUMENTASI FOTO</span>
          <span>Sheet 1 dari 1</span>
        </footer>
      `;
      previewSheetsContainer.appendChild(sheet);
      return;
    }

    // Determine chunk size per sheet
    let perSheet = state.imagesPerSheet === 'auto' ? state.images.length : parseInt(state.imagesPerSheet, 10);
    if (!perSheet || perSheet < 1) perSheet = state.images.length;

    // Chunk images array into multiple sheets
    const imageChunks = [];
    for (let i = 0; i < state.images.length; i += perSheet) {
      imageChunks.push(state.images.slice(i, i + perSheet));
    }

    const totalSheets = imageChunks.length;
    sheetsCountTag.textContent = `${totalSheets} Sheet${totalSheets > 1 ? 's' : ''}`;

    // Render each sheet container
    imageChunks.forEach((chunk, pageIndex) => {
      const sheet = document.createElement('div');
      sheet.className = `a4-sheet ${isLandscape ? 'landscape' : ''}`;
      sheet.setAttribute('data-sheet-index', pageIndex + 1);

      // Sheet Header
      let sheetHtml = `
        <span class="sheet-meta-badge">Sheet ${pageIndex + 1} / ${totalSheets}</span>
        <header class="pdf-header">
          <h1 class="pdf-title-date">${escapeHtml(headerTitleText)}</h1>
          <div class="pdf-header-divider"></div>
        </header>
        <div class="pdf-image-grid cols-${state.gridCols}">
      `;

      // Sheet Image Cards
      chunk.forEach((img, idx) => {
        const globalIdx = pageIndex * perSheet + idx + 1;
        sheetHtml += `
          <div class="pdf-img-card">
            <img src="${img.dataUrl}" alt="Gambar ${globalIdx}">
          </div>
        `;
      });

      sheetHtml += `
        </div>
        <footer class="pdf-page-footer">
          <span>DOKUMENTASI FOTO — ${escapeHtml(headerTitleText)}</span>
          <span>Halaman ${pageIndex + 1} dari ${totalSheets}</span>
        </footer>
      `;

      sheet.innerHTML = sheetHtml;
      previewSheetsContainer.appendChild(sheet);
    });
  }

  // ==========================================
  // 7. Controls & Event Listeners
  // ==========================================
  dateInput.addEventListener('input', () => {
    renderPreviewGrid();
  });

  todayPresetBtn.addEventListener('click', () => {
    dateInput.value = getIndonesianDateString();
    renderPreviewGrid();
    showToast('Tanggal diubah ke hari ini.');
  });

  uppercaseBtn.addEventListener('click', () => {
    dateInput.value = dateInput.value.toUpperCase();
    renderPreviewGrid();
  });

  clearAllBtn.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua gambar?')) {
      state.images = [];
      renderUI();
      showToast('Semua gambar dihapus.', 'error');
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

  imagesPerSheetSelect.addEventListener('change', (e) => {
    state.imagesPerSheet = e.target.value === 'auto' ? 'auto' : parseInt(e.target.value, 10);
    renderPreviewGrid();
  });

  // ==========================================
  // 8. Generate & Download PDF (Multi-Sheet Support)
  // ==========================================
  async function generatePDF() {
    if (state.images.length === 0) {
      showToast('Upload minimal 1 gambar terlebih dahulu!', 'error');
      return;
    }

    // Set Loading State
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

      // Find all rendered sheet containers
      const sheetElements = previewSheetsContainer.querySelectorAll('.a4-sheet');
      
      for (let i = 0; i < sheetElements.length; i++) {
        const sheetEl = sheetElements[i];

        if (i > 0) {
          pdf.addPage();
        }

        // Render sheet DOM to Canvas at scale 2 for high DPI crisp rendering
        const canvas = await html2canvas(sheetEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // 3. Download File
      const dateStr = dateInput.value.trim() || 'Dokumentasi-Gambar';
      const filename = `${sanitizeFilename(dateStr)}.pdf`;
      pdf.save(filename);

      showToast(`PDF ${filename} (${sheetElements.length} sheet) berhasil dibuat & didownload!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Gagal membuat PDF. Silakan coba lagi.', 'error');
    } finally {
      // Reset Button State
      generatePdfBtn.disabled = false;
      btnText.style.display = 'flex';
      btnLoader.style.display = 'none';
    }
  }

  generatePdfBtn.addEventListener('click', generatePDF);

  // Initial Render Setup
  renderUI();
});
