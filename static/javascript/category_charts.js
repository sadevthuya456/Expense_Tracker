// Shared pie-chart code for the weekly / monthly / yearly pages.
// Draws one chart for expenses (#myChart) and one for income (#incomeChart).

const CATEGORY_COLORS = [
    [255, 99, 132], [54, 162, 235], [255, 206, 86], [75, 192, 192], [153, 102, 255],
    [255, 159, 64], [46, 204, 113], [231, 76, 60], [52, 73, 94], [149, 165, 166]
];

const drawCategoryChart = (canvasId, endpoint, type, title) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    fetch(`${endpoint}?type=${type}`, { credentials: 'same-origin' })
        .then(res => res.json())
        .then(result => {
            const categoryData = result.expense_category_data || {};
            const labels = Object.keys(categoryData);
            const values = Object.values(categoryData);

            if (labels.length === 0) {
                canvas.style.display = 'none';
                const msg = document.createElement('p');
                msg.className = 'text-muted text-center my-5';
                msg.textContent = `No ${type.toLowerCase()} recorded in this period.`;
                canvas.parentNode.appendChild(msg);
                return;
            }

            const colour = (i, alpha) => {
                const c = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
            };

            new Chart(canvas.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: labels.map((_, i) => colour(i, 0.6)),
                        borderColor: labels.map((_, i) => colour(i, 1)),
                        borderWidth: 1
                    }]
                },
                options: {
                    title: { display: true, text: title }
                }
            });
        })
        .catch(err => console.error(`Could not load ${type} chart`, err));
};

const renderCategoryCharts = (endpoint) => {
    document.addEventListener('DOMContentLoaded', () => {
        drawCategoryChart('myChart', endpoint, 'Expense', 'Expense per Category');
        drawCategoryChart('incomeChart', endpoint, 'Income', 'Income per Category');
    });
};
