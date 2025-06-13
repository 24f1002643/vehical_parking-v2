export default {
    template: `
        <div class="container mt-5">
            <div class="text-center mb-4">
                <h2>Parking Reservation Summary</h2>
            </div>
            <div class="card shadow-sm p-4 mb-5">
                <canvas id="summaryChart" style="min-height: 300px;"></canvas>
            </div>
            <div class="text-center mb-4">
                <h2>Monthly Revenue ({{ new Date().getFullYear() }})</h2>
            </div>
            <div class="card shadow-sm p-4">
                <canvas id="revenueChart" style="min-height: 300px;"></canvas>
            </div>
        </div>
    `,
    data() {
        return {
            labels: [],
            data: [],
            revenueLabels: [],
            revenueData: [],
            _chartInstance: null,
            _revenueChartInstance: null
        };
    },
    mounted() {
        this.loadChartScript().then(() => {
            this.fetchSummaryData();
        });
    },
    methods: {
        async loadChartScript() {
            if (!window.Chart) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.async = true;
                document.head.appendChild(script);
                await new Promise(resolve => {
                    script.onload = resolve;
                });
            }
        },
        async fetchSummaryData() {
            try {
                const res = await fetch(location.origin + '/admin/summary', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });

                if (res.ok) {
                    const json = await res.json();

                    // Lot chart data
                    this.labels = json.lot.labels;
                    this.data = json.lot.data;

                    // Revenue chart data
                    this.revenueLabels = json.revenue.labels;
                    this.revenueData = json.revenue.data;

                    this.$nextTick(() => {
                        this.renderChart();
                        this.renderRevenueChart();
                    });
                } else {
                    console.error('Failed to fetch summary data.');
                }
            } catch (error) {
                console.error('Error fetching summary data:', error);
            }
        },
        renderChart() {
            const ctx = document.getElementById('summaryChart');
            if (!ctx || !window.Chart) return;

            if (this._chartInstance) {
                this._chartInstance.destroy();
            }

            this._chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.labels,
                    datasets: [{
                        label: 'Total Reservations',
                        data: this.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Reservations per Parking Lot'
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...this.data) + 5,
                            title: {
                                display: true,
                                text: 'Number of Reservations'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Parking Lot'
                            }
                        }
                    }
                }
            });
        },
        renderRevenueChart() {
            const ctx = document.getElementById('revenueChart');
            if (!ctx || !window.Chart) return;

            if (this._revenueChartInstance) {
                this._revenueChartInstance.destroy();
            }

            this._revenueChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.revenueLabels,
                    datasets: [{
                        label: 'Revenue (INR)',
                        data: this.revenueData,
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Revenue'
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...this.revenueData) + 100,
                            title: {
                                display: true,
                                text: 'Revenue (INR)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Month'
                            }
                        }
                    }
                }
            });
        }
    }
};
