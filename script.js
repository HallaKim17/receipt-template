// Add html2canvas library
const script = document.createElement('script');
script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
document.head.appendChild(script);

// Function to format currency in Korean Won
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(amount);
};

// Function to get the last day of the month
const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
};

// Function to update receipt dates
const updateReceiptDates = (year, month) => {
    const yearMonthDisplay = document.getElementById('yearMonthDisplay');
    const dueDateDisplay = document.getElementById('dueDateDisplay');
    const dueDateValue = document.getElementById('dueDateValue');
    
    // Display the year and month for the receipt
    yearMonthDisplay.textContent = `${year}년 ${month}월분`;
    
    // Set current date
    const currentDate = new Date();
    dueDateDisplay.textContent = `${year}년 ${month}월 ${currentDate.getDate()}일`;
    
    // Set due date (last day of the month)
    const lastDay = getLastDayOfMonth(year, month);
    dueDateValue.textContent = `${year}년 ${month}월 ${lastDay}일까지`;
};

// Function to update receipt content
const updateReceiptContent = (data) => {
    const {tenantName, electricityFee, waterFee, managementFee, total, year, month} = data;
    
    try {
        // Update receipt content
        const elements = {
            'tenantNameValue': tenantName,
            'electricityFeeValue': formatCurrency(electricityFee),
            'waterFeeValue': formatCurrency(waterFee),
            'managementFeeValue': formatCurrency(managementFee),
            'totalAmount': formatCurrency(total)
        };

        // Update each element
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.error(`Element with id '${id}' not found`);
            }
        }

        // Update dates
        updateReceiptDates(year, month);

        return true;
    } catch (error) {
        console.error('Error updating receipt content:', error);
        return false;
    }
};

// Handle form submission
document.getElementById('feeForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Get and validate form values
    const year = parseInt(document.getElementById('yearInput').value);
    const month = parseInt(document.getElementById('monthInput').value);
    const tenantName = document.getElementById('tenantName').value;
    const electricityFee = parseFloat(document.getElementById('electricityFee').value) || 0;
    const waterFee = parseFloat(document.getElementById('waterFee').value) || 0;
    const managementFee = parseFloat(document.getElementById('managementFee').value) || 0;
    const total = electricityFee + waterFee + managementFee;
    
    try {
        // Update receipt content
        const updated = updateReceiptContent({
            tenantName,
            electricityFee,
            waterFee,
            managementFee,
            total,
            year,
            month
        });

        if (!updated) {
            throw new Error('영수증 내용 업데이트에 실패했습니다');
        }

        // Show receipt container
        const receiptContainer = document.getElementById('receiptContainer');
        receiptContainer.style.display = 'block';

        // Scroll to receipt
        receiptContainer.scrollIntoView({ behavior: 'smooth' });

        // Handle download button click
        document.getElementById('downloadBtn').onclick = async function() {
            try {
                const receipt = document.getElementById('receipt');
                if (!receipt) {
                    throw new Error('영수증을 찾을 수 없습니다');
                }

                // Generate receipt image
                const canvas = await html2canvas(receipt, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                // Download image
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `관리비영수증_${year}년${month}월_${tenantName}.png`;
                link.href = image;
                link.click();
            } catch (error) {
                console.error('Error generating receipt image:', error);
                alert('영수증 이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        };
    } catch (error) {
        console.error('Error:', error);
        alert('영수증 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
});
