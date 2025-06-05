document.getElementById('currentYear').textContent = new Date().getFullYear();

// --- CẤU HÌNH CỦA BẠN (ĐÃ CẬP NHẬT) ---
const SHEET_ID = '1n9_vsRzPWOW7w4jgLI6vjbGF1LcEoR4tMxrpEg4N4uI';
const API_KEY = 'AIzaSyCZ8p4pw-L_CyMSM4uEHXSszJC1MWespo4'; // CẢNH BÁO: Key này đang công khai. Hãy thay thế bằng key mới và bảo mật!
const SHEET_NAME = 'Trang tính1';
const DATA_RANGE = 'A2:E';
const DATA_COLUMNS_TO_DISPLAY_TEXT = 4; // (Nội dung, Tên, Môn, Ngày)
const LINK_COLUMN_INDEX = 4;  // Chỉ số của cột Link (cột E)
const TOTAL_DESKTOP_COLUMNS = 6; // STT + Nội dung + Tên + Môn + Ngày + Link
// --- KẾT THÚC CẤU HÌNH ---

const tableBody = document.getElementById('taiLieuTableBody');
const messageArea = document.getElementById('messageArea');
const searchInput = document.getElementById('searchInput');

async function fetchSheetData() {
    if (API_KEY === 'AIzaSyCZ8p4pw-L_CyMSM4uEHXSszJC1MWespo4') {
         displayMessage('Các bạn xài điện thoại chịu khó tải bằng Google Drive giúp mình nhá.', 'warning');
         // Bạn có thể quyết định có dừng thực thi ở đây không nếu muốn
         // return;
    }
    if (!SHEET_ID || SHEET_ID === 'YOUR_SHEET_ID' || !API_KEY || API_KEY === 'YOUR_API_KEY_PLACEHOLDER') { // Sửa placeholder nếu bạn dùng tên khác
        displayMessage('Vui lòng cấu hình SHEET_ID và API_KEY hợp lệ trong file HTML.', 'error');
        tableBody.innerHTML = `<tr><td colspan="${TOTAL_DESKTOP_COLUMNS}" class="text-center text-error py-10 font-semibold">Lỗi: Chưa cấu hình SHEET_ID hoặc API_KEY.</td></tr>`;
        return;
    }

    const encodedSheetName = encodeURIComponent(SHEET_NAME);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodedSheetName}!${DATA_RANGE}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Error fetching data:', response.status, response.statusText, errorData);
            let errorMessage = `Lỗi ${response.status}: ${response.statusText}. Không thể tải dữ liệu.`;
            if (errorData && errorData.error && errorData.error.message) {
                errorMessage += ` Chi tiết: ${errorData.error.message}`;
                 if (errorData.error.message.toLowerCase().includes("unable to parse range")) {
                    errorMessage += ` Kiểm tra lại SHEET_NAME ('${SHEET_NAME}') và DATA_RANGE ('${DATA_RANGE}') có đúng với cấu trúc Google Sheet của bạn không (Sheet ID: '${SHEET_ID}').`;
                } else if (errorData.error.details && errorData.error.details[0] && errorData.error.details[0].reason === "API_KEY_INVALID") {
                     errorMessage += " API Key của bạn không hợp lệ hoặc đã bị thu hồi/giới hạn không đúng cách.";
                } else if (errorData.error.status === "PERMISSION_DENIED") {
                    errorMessage += " Google Sheet chưa được chia sẻ công khai (chế độ 'Bất kỳ ai có đường liên kết đều có thể xem').";
                }
            }
            displayMessage(errorMessage, 'error');
            tableBody.innerHTML = `<tr><td colspan="${TOTAL_DESKTOP_COLUMNS}" class="text-center text-error py-10 font-semibold">${escapeHtml(errorMessage)}</td></tr>`;
            return;
        }
        const data = await response.json();
        displayData(data.values);
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        displayMessage(`Không thể tải dữ liệu: ${error.message}. Kiểm tra console và kết nối mạng.`, 'error');
        tableBody.innerHTML = `<tr><td colspan="${TOTAL_DESKTOP_COLUMNS}" class="text-center text-error py-10 font-semibold">Lỗi khi tải dữ liệu.</td></tr>`;
    }
}

function displayData(rows) {
    tableBody.innerHTML = '';
    if (!rows || rows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${TOTAL_DESKTOP_COLUMNS}" class="text-center py-10 text-lg">Không có tài liệu nào.</td></tr>`;
        return;
    }

    rows.forEach((row, index) => {
        if (row.length < LINK_COLUMN_INDEX + 1 && row.filter(String).length === 0) { return; }

        const tr = document.createElement('tr');
        tr.className = 'hover';
        let cellsHtml = `<th class="text-left">${index + 1}</th>`;

        for (let i = 0; i < DATA_COLUMNS_TO_DISPLAY_TEXT; i++) {
            const cellData = row[i] || '';
            let displayedContent = '';
            let cellClass = '';

            if (i === 0) {
                if (cellData.toLowerCase().includes('drive.google.com') || cellData.toLowerCase().includes('link')) {
                    displayedContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 inline-block align-middle text-primary"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-4-4a2 2 0 012.828-2.828l.707.707-1.707 1.707a.5.5 0 00.707.707l1.707-1.707z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M8.414 15.414a2 2 0 102.828-2.828l-3-3a2 2 0 00-2.828 0l-4 4a2 2 0 002.828 2.828l.707-.707-1.707-1.707a.5.5 0 11.707-.707l1.707 1.707z" clip-rule="evenodd" /></svg> <span class="hidden sm:inline">Link</span>`;
                } else if (cellData.length > 25) {
                    displayedContent = `<span title="${escapeHtml(cellData)}">${escapeHtml(cellData.substring(0, 20))}...</span>`;
                } else {
                    displayedContent = escapeHtml(cellData);
                }
            } else if (i === 3) { // Cột "Ngày đăng tải" (chỉ số 3)
                displayedContent = escapeHtml(cellData);
                cellClass = "hidden md:table-cell";
            }
            else {
                displayedContent = escapeHtml(cellData);
            }
            cellsHtml += `<td class="${cellClass}">${displayedContent}</td>`;
        }

        const linkUrl = row[LINK_COLUMN_INDEX] || '';
        if (linkUrl.trim() !== '' && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'))) {
            cellsHtml += `
                <td class="text-center">
                    <a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-xs sm:btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 sm:w-5 sm:h-5 inline-block align-middle"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>
                        <span class="hidden sm:inline ml-1">Tải</span>
                    </a>
                </td>`;
        } else {
            cellsHtml += `<td></td>`;
        }
        tr.innerHTML = cellsHtml;
        tableBody.appendChild(tr);
    });
}

function displayMessage(message, type = 'info') {
    messageArea.innerHTML = '';
    const alertClasses = { info: 'alert-info', success: 'alert-success', warning: 'alert-warning', error: 'alert-error' };
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClasses[type] || 'alert-info'} shadow-lg transition-all duration-300 ease-in-out transform opacity-0 translate-y-2`;
    alertDiv.setAttribute('role', 'alert');
    let iconSvg = '';
    switch(type) {
        case 'error': iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'; break;
        case 'success': iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'; break;
        default: iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }
    alertDiv.innerHTML = `<div class="flex items-center">${iconSvg}<span class="ml-2">${escapeHtml(message)}</span></div>`;
    messageArea.appendChild(alertDiv);
    setTimeout(() => { alertDiv.classList.remove('opacity-0', 'translate-y-2'); alertDiv.classList.add('opacity-100', 'translate-y-0'); }, 10);
    if (type !== 'error' || message.startsWith('CẢNH BÁO BẢO MẬT')) { // Giữ cảnh báo bảo mật lâu hơn
         setTimeout(() => {
            alertDiv.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => { if(messageArea.contains(alertDiv)) messageArea.removeChild(alertDiv); }, 300);
        }, message.startsWith('CẢNH BÁO BẢO MẬT') ? 15000 : 7000); // 15 giây cho cảnh báo API key
    }
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') { return unsafe; }
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function filterTable() {
    const filter = searchInput.value.toUpperCase().trim();
    const rows = tableBody.getElementsByTagName('tr');
    let found = false;
    let hasVisibleContentRow = false;

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells.length === 1 && cells[0].getAttribute('colspan')) { rows[i].style.display = ''; continue; }
        if (rows[i].id === 'noResultsRow') { continue; }

        let displayRow = false;
        if (cells.length > 0) {
            hasVisibleContentRow = true;
            for (let j = 0; j < DATA_COLUMNS_TO_DISPLAY_TEXT; j++) {
                const cellIsActuallyHidden = cells[j].classList.contains('hidden') || (cells[j].classList.contains('md:table-cell') && window.innerWidth < 768);
                if (cells[j] && !cellIsActuallyHidden && cells[j].textContent.toUpperCase().indexOf(filter) > -1) {
                    displayRow = true;
                    found = true;
                    break;
                }
            }
            rows[i].style.display = displayRow ? '' : 'none';
        }
    }
    const noResultsRow = document.getElementById('noResultsRow');
    if (noResultsRow) { noResultsRow.remove(); }
    if (!found && filter !== '' && hasVisibleContentRow) {
        const newNoResultsRow = tableBody.insertRow();
        newNoResultsRow.id = 'noResultsRow';
        const cell = newNoResultsRow.insertCell();
        cell.colSpan = TOTAL_DESKTOP_COLUMNS;
        cell.className = 'text-center py-10 text-lg';
        cell.textContent = 'Không tìm thấy tài liệu nào phù hợp.';
    }
}
fetchSheetData();
const typingTextEl = document.querySelector('.typing-text');
const typingString = "Phát triển với ❤️, Google Sheets API, Tailwind CSS & DaisyUI bởi Khang Ngô và Phúc Tiến.";
let index = 0;
let isDeleting = false;

function typeEffect() {
    if (!typingTextEl) return;

    if (isDeleting) {
        index--;
    } else {
        index++;
    }

    typingTextEl.innerHTML = typingString.substring(0, index);

    if (!isDeleting && index === typingString.length) {
        setTimeout(() => isDeleting = true, 2000); // Dừng 2s khi gõ xong
    } else if (isDeleting && index === 0) {
        isDeleting = false;
    }

    const speed = isDeleting ? 40 : 70;
    setTimeout(typeEffect, speed);
}

typeEffect();