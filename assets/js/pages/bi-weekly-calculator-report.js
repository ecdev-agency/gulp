jQuery(document).ready(function ($) {
        $('.share_place .btn_share').click(function (e) {
            e.preventDefault();
            $(this).parent().find('.items_share').slideToggle(300);
            $(this).toggleClass('active');
        });

        $('.share_place .items_share > a').click(function () {
            $('.share_place .btn_share').toggleClass('active');
            $(this).parent().slideToggle(300);
        });

        document.onclick = function (e) {
            if (e.target.id !== 'share_place' && e.target.id !== 'share_btn') {
                if ($('.share_place .btn_share').hasClass('active')) {
                    $('.share_place .btn_share').toggleClass('active');
                    $('.share_place .items_share').slideToggle(300);
                }
            }
        };

        $(document).on('click', '.amortization-table .toggle .row-year', function () {
            $(this).parent().toggleClass('expand');
        });


        // custom scroll for
        jQuery('.cus_scroll').on('input', function () {
            var table_parent = jQuery(this).closest('.outer');
            var inner_width = table_parent.find('.inner').width();
            var table_width = table_parent.find('table').width();
            var cus_scroll = (table_width - inner_width) / 100;
            table_parent.find('.inner').scrollLeft(jQuery(this).val() * cus_scroll);
        });

        var cus_scroll = $(this).scrollLeft();

        $('.inner').on('touchmove', function (e) {
            var table_parent = jQuery(this).closest('.outer');
            var table_width = table_parent.find('table').width();
            var inner_width = $('.cus_scroll').width();
            var cus_scroll = (inner_width - 214) / inner_width;
            table_parent.find('.cus_scroll').val($(this).scrollLeft() * cus_scroll);
        });

        /*- chart js */

        var legend_display = false;
        if ($(window).width() < 991) legend_display = false;

        var chartBwData = {
            datasets: [{
                label: 'Monthly payments',
                data: chart['mo_to_year_array'],
                borderColor: '#673AB7',
                backgroundColor: '#F0F3FF',
                fill: false,
                borderWidth: 1,
                pointRadius: 2,
                pointStyle: 'circle',
                pointHitRadius: 15,
                pointHoverBackgroundColor: '#673AB7',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                pointHoverRadius: 3,
                pointRotation: 20,
                usePointStyle: true
            }, {
                label: 'Biweekly payments',
                data: chart['bw_to_year_array'],
                borderColor: '#4064E4',
                backgroundColor: '#F0F3FF',
                borderWidth: 1,
                pointStyle: 'circle',
                pointRadius: 2,
                pointHitRadius: 15,
                pointHoverBackgroundColor: '#4064E4',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 1,
                pointHoverRadius: 3,
                pointRotation: 20
            }],
            labels: chart['labels']
        };

        Chart.defaults.LineWithLine = Chart.defaults.line;
        Chart.controllers.LineWithLine = Chart.controllers.line.extend({
            draw: function draw(ease) {
                Chart.controllers.line.prototype.draw.call(this, ease);

                if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                    var activePoint = this.chart.tooltip._active[0],
                        ctx = this.chart.ctx,
                        x = activePoint.tooltipPosition().x,
                        topY = this.chart.scales['y-axis-0'].top,
                        bottomY = this.chart.scales['y-axis-0'].bottom; // draw line

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, topY);
                    ctx.lineTo(x, bottomY);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#8B8B8B';
                    ctx.stroke();
                    ctx.restore();
                }
            }
        });
        Chart.defaults.global.pointHitDetectionRadius = 1;
        var mobile_width = $(window).width() > 900;

        var customTooltipsBw = function customTooltipsBw(tooltip) {
            // Tooltip Element
            var tooltipEl = document.getElementById('chartjs-tooltip');

            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.innerHTML = "<table class='table_tooltip'></table>";
                document.body.appendChild(tooltipEl);
                if (!mobile_width) {
                    document.getElementById('for_tooltip').appendChild(tooltipEl);
                }
                else {
                    document.body.appendChild(tooltipEl);
                }
            } // Hide if no tooltip

            if (tooltip.opacity === 0 && mobile_width) {
                tooltipEl.style.opacity = 0;
                return;
            } // Set caret Position


            tooltipEl.classList.remove('above', 'below', 'no-transform');

            if (tooltip.yAlign) {
                tooltipEl.classList.add(tooltip.yAlign);
            } else {
                tooltipEl.classList.add('no-transform');
            }

            function getBody(bodyItem) {
                return bodyItem.lines;
            } // Set Text


            if (tooltip.body) {
                var titleLines = tooltip.title || [];
                var bodyLines = tooltip.body.map(getBody); //PUT CUSTOM HTML TOOLTIP CONTENT HERE (innerHTML)

                var innerHtml = '<thead>';
                titleLines.forEach(function (title) {
                    innerHtml += '<tr><th>' + title + '</th></tr>';
                });
                innerHtml += '</thead><tbody>';
                bodyLines.forEach(function (body, i) {
                    var colors = tooltip.labelColors[i];
                    var style = 'background:' + colors.backgroundColor;
                    style += '; border-color:' + colors.borderColor;
                    style += '; border-width: 2px';
                    var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                    innerHtml += '<tr><td>' + span + body + '</td></tr>';
                });
                innerHtml += '</tbody>';
                var tableRoot = tooltipEl.querySelector('table');
                tableRoot.innerHTML = innerHtml;
            }

            var position = this._chart.canvas.getBoundingClientRect(); // Display, position, and set styles for font


            tooltipEl.style.opacity = 1; //tooltipEl.style.top = position.top + tooltip.caretY + 'px';
            //tooltipEl.style.left = position.left + tooltip.caretX + 'px';

            var height_to_shedule = $('#amortization-chart').offset().top;
            var shedule_height = $('#amortization-chart').height() / 2;
            var tooltip_width = $(tooltipEl).width();
            tooltipEl.style.left = position.left + tooltip.caretX - (tooltip_width + 15) + 'px';
            var tooltip_height = $(tooltipEl).height();

            if (tooltip.caretY > shedule_height) {
                tooltipEl.style.top = height_to_shedule + tooltip.caretY - tooltip_height + 'px';
            } else {
                tooltipEl.style.top = height_to_shedule + tooltip.caretY + 'px';
            }

            tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
        };

        var bwChart = new Chart($('#amortization-chart'), {
            type: 'LineWithLine',
            data: chartBwData,
            options: {
                responsive: true,
                usePointStyle: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Chart.js LineWithLine'
                    }
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: customTooltipsBw,
                    backgroundColor: '#ffffff',
                    titleFontColor: '#000000',
                    bodyFontColor: '#000000',
                    titleFont: {
                        style: 'bold',
                        size: '36'
                    },
                    bodySpacing: 4,
                    caretPadding: 8,
                    titleMarginBottom: 13,
                    padding: 100,
                    cornerRadius: 4,
                    usePointStyle: true,
                    callbacks: {
                        title: function title(tooltipItem) {
                            return 'Year ' + tooltipItem[0].index;
                        },
                        label: function label(tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label + ': ';
                            label += '<b>$ ' + Math.round(tooltipItem.yLabel).toLocaleString('en') + '</b>';
                            return label;
                        }
                    }
                },
                legend: {
                    display: legend_display,
                    position: 'bottom',
                    usePointStyle: 'true',
                    labels: {
                        boxWidth: 0,
                        boxHeight: 0,
                        padding: 30,
                        fontSize: 16,
                        pointStyle: 'circle',
                        fontColor: '#000000',
                        usePointStyle: 'true',
                        color: 'rgb(255, 99, 132)'
                    }
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            labelString: 'Length of Loan (loan)'
                        },
                        gridLines: {
                            drawOnChartArea: false,
                            borderDashOffset: 3
                        },
                        ticks: {
                            maxRotation: 0,
                            callback: function callback(value, index) {
                                if(($(window).width() < 767) && (chart['labels'].length > 20)){
                                    if (index % 3 === 0) return value;
                                } else {
                                    if (index % 2 !== 0) return value;
                                }
                            },
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            callback: function callback(value) {
                                return '$' + (value > 999 ? value / 1000 + 'k' : value);
                            },
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

    /**
     * Mobile Info Table Panel Close
     * @click
     */
    $(document).on('click', '.mortgage_report__shedule-table-info .close', function (e) {

        $(this).parent().remove();

        e.preventDefault();

    });

    /**
     * Share Plugins
     * @tippy
     */
    if( $('#btnShare').length ) {

        /**
         * Template Popper
         * @type {HTMLElement}
         */
        const template_share = document.getElementById('contentShare');

        /**
         * Tippy
         */
        tippy('#btnShare', {
            trigger             : 'click',
            placement           : 'bottom-start',
            content             : template_share.innerHTML,
            allowHTML           : true,
            interactiveDebounce : 0,
            interactive         : true,
            interactiveBorder   : 0,
            appendTo            : document.getElementById('main'),
        });

    }

    });