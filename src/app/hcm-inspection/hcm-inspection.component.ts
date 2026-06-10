import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableConfig, TableColumn } from '../common/dynamic-table-chart/dynamic-table-chart.model';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-hcm-inspection',
  templateUrl: './hcm-inspection.component.html',
  styleUrls: ['./hcm-inspection.component.scss']
})
export class HcmInspectionComponent implements OnInit, OnDestroy {

  // ─── Page Meta ─────────────────────────────────────────
  headerTitle = 'ICDS - HCM Inspection (State)';

  // ─── Role / Access ──────────────────────────────────────
  localUser = localStorage.getItem('user');
  user = JSON.parse(this.localUser || '{}');
  role = this.user?.role?.role_name;

  isAccess = true;
  isStateUser = false;
  isDistrictUser = false;
  isBlockUser = false;

  // ─── Date Range ─────────────────────────────────────────
  fromDate: string = '';
  toDate: string = '';

  // ─── Year / Month ───────────────────────────────────────
  years: number[] = [];
  currentYear = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;
  selectedYear: any;
  selectedMonth: string = (new Date().getMonth() + 1).toString();

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ─── Filters ────────────────────────────────────────────
  districtData: any[] = [];
  blockData: any[] = [];
  sectorData: any[] = [];
  selectedDistrict = '';
  selectedBlock = '';
  selectedSector = '';

  selectedTableUserType = 'Block Supervisor';

  users: string[] = [];
  selectedUser = 'Block Supervisor';

  // ─── User type toggle (multi-select like reference UI) ──
  selectedUserTypes: string[] = ['Block Supervisor', 'CDPO', 'DPO'];

  // ─── Indicator Options ──────────────────────────────────
  indicatorOptions = [
    { label: 'Overall Compliance',  value: 'overall_compliance' },
    { label: 'Stock Match',         value: 'stock_match' },
    { label: 'Food Storage',        value: 'food_storage' },
    { label: 'Expired Disposal',    value: 'expired_disposal' },
    { label: 'Egg Quality',         value: 'egg_quality' },
    { label: 'Register Updated',    value: 'register_updated' },
    { label: 'Food Quality',        value: 'food_quality' },
  ];
  selectedIndicator = 'stock_match';

  isChartView = false;

  // ─── Loading flags ──────────────────────────────────────
  isLoading = false;
  isLoadingMetrics = false;
  isLoadingMonthwise = false;
  isLoadingUserwise = false;
  isLoadingDistrictwise = false;

  // ─── Metrics ────────────────────────────────────────────
  metricsData: any = null;

  // ─── Labels ────────────────────────────────────────────
  labelChanges = {
    monthwiseTrendChart: 'Month-wise Compliance Trend',
    userwiseTrendChart: 'User-wise Compliance Comparison',
    districtwiseTrendChart: 'District-wise Analysis',
  };

  // ─── Toggle Options ─────────────────────────────────────
  userwiseToggleOptions = [
    { label: 'All',        value: 'all' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'CDPO',       value: 'cdpo' },
    { label: 'DPO',        value: 'dpo' },
  ];
  selectedUserwiseToggle = 'all';

  districtwiseToggleOptions = [
    { label: 'All',        value: 'all' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'CDPO',       value: 'cdpo' },
    { label: 'DPO',        value: 'dpo' },
  ];
  selectedDistrictwiseToggle = 'all';

  // ─── Month-wise Area/Line Chart ─────────────────────────
  monthwiseTrendLabels: string[] = [];
  monthwiseTrendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Stock Match',
        borderColor: '#5D87FF',
        backgroundColor: 'rgba(93,135,255,0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5D87FF',
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  // ─── User-wise Grouped Bar Chart ────────────────────────
  userwiseTrendLabels: string[] = [];
  userwiseTrendChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Block Supervisor', backgroundColor: '#5D87FF', borderRadius: 4},
      { data: [], label: 'CDPO',             backgroundColor: '#FFA500', borderRadius: 4},
      { data: [], label: 'DPO',              backgroundColor: '#4CAF50', borderRadius: 4},
    ]
  };

  // ─── District-wise Bar Chart ────────────────────────────
  districtwiseTrendLabels: string[] = [];
  districtwiseTrendChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Compliance %',
        backgroundColor: '#4CAF50',
        hoverBackgroundColor: '#388E3C',
        borderRadius: 6,
        barThickness: 30,
      }
    ]
  };

  // ─── Area / Line Chart Options ──────────────────────────
  areaChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      datalabels: { display: false }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 5,
          callback: (v: any) => v + '%'
        },
        title: { display: true, text: 'Compliance %' }
      },
      x: {
        title: { display: true, text: 'Month →' }
      }
    }
  };

  // ─── Grouped Bar Chart Options ──────────────────────────
   groupedBarChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
    datalabels: {
      display: true,
      anchor: 'end',
      align: 'end',
      rotation: -90,
      formatter: (value: number) => value > 0 ? value.toFixed(1) + '%' : '',
      font: { size: 10, weight: 'bold' },
      color: 'black',
      clamp: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 120,
      ticks: {
        stepSize: 25,
        callback: (v: any) => v <= 100 ? v + '%' : ''
      },
      title: { display: true, text: 'Compliance →' }
    },
    x: {
      ticks: { maxRotation: 45 }
    }
  },
  // ↓ Controls bar width and spacing
  datasets: {
    bar: {
      categoryPercentage: 0.5,   // fraction of category slot used by the group (0.5 = 50% → more gap between groups)
      barPercentage: 0.6,        // fraction of group slot used by each bar (0.6 = thinner bars with gap between them)
    }
  }
};

  // ─── District Bar Chart Options ─────────────────────────
  districtBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        anchor: 'center',
        align: 'center',
        formatter: (value: number) => value > 0 ? value.toFixed(1) + '%' : '',
        font: { size: 13, weight: 'bold' },
        color: '#ffffff',
        clamp: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 110,
        ticks: {
          callback: (v: any) => v <= 100 ? v + '%' : ''
        },
        title: { display: true, text: 'Compliance →' }
      },
      x: {
        title: { display: true, text: 'Districts →' }
      }
    }
  };

  // ─── Table / Chart Config ───────────────────────────────
  headerConfig = {
    title: 'District wise % of HCM Inspection Compliance',
    sectionType: 'District',
    showExcelDownload: true,
    showChartDownload: true
  };

  tableConfig: TableConfig = {
    enableSearch: true,
    showFooter: true,
    columns: []
  };

  chartConfig = {
    enabled: true,
    enableSort: true,
    labelColumnKey: 'name',
    dataColumnKey: 'overall_compliance',
    chartLabel: 'Overall Compliance %',
    chartFileName: 'hcm-inspection.png',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 110, title: { display: true, text: '% Compliance' } }
      }
    }
  };

  tableData: any[] = [];

  // ─── Constructor ────────────────────────────────────────
  constructor(
    private service: DashboardServiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.getAccessForThisComponent();
    this.findingYear();
    this.staticCall();
  }

  ngOnDestroy(): void {}

  // ─── Access Control ─────────────────────────────────────
  getAccessForThisComponent(): void {
    switch (this.role) {
      case 'DPO':
      case 'District Collector':
      case 'District Coordinator':
        this.isDistrictUser = true;
        this.users = ['Block Supervisor', 'CDPO', 'DPO'];
        this.selectedUser = 'Block Supervisor';
        break;
      case 'CDPO':
        this.isBlockUser = true;
        this.users = ['Block Supervisor', 'CDPO'];
        this.selectedUser = 'Block Supervisor';
        break;
      case 'Block Supervisor':
        this.isAccess = false;
        this.users = [];
        break;
      case 'Root':
      case 'Zone Officer':
        this.isStateUser = true;
        this.users = ['Block Supervisor', 'CDPO', 'DPO', 'All'];
        this.selectedUser = 'All';
        break;
      default:
        this.isAccess = true;
        this.users = ['Block Supervisor', 'CDPO', 'DPO', 'All'];
        this.selectedUser = 'All';
    }
  }

  // ─── Year Setup ─────────────────────────────────────────
  findingYear(): void {
    this.years = [];
    for (let y = 2025; y <= 2030; y++) this.years.push(y);
    this.selectedYear = this.currentYear;
  }

  // ─── Initial Calls ──────────────────────────────────────
  staticCall(): void {
    this.loadDistrictData();
    if (this.isStateUser) {
      this.loadDashboardData();
    }
  }

  // ─── Main Dashboard Load ─────────────────────────────────
  loadDashboardData(): void {
    this.clearAllData();
    this.prepareJson();
    this.loadMetrics();
    this.loadMonthwiseTrend();
    this.loadUserwiseTrend();
    // this.loadDistrictwiseTrend();
    this.loadHierarchicalData();
  }

  private clearAllData(): void {
    this.metricsData = null;
    this.monthwiseTrendLabels = [];
    this.monthwiseTrendChartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Stock Match',
          borderColor: '#5D87FF',
          backgroundColor: 'rgba(93,135,255,0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#5D87FF',
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };
    this.userwiseTrendLabels = [];
    this.userwiseTrendChartData = {
      labels: [],
      datasets: [
        { data: [], label: 'Block Supervisor', backgroundColor: '#5D87FF', borderRadius: 4 },
        { data: [], label: 'CDPO',             backgroundColor: '#FFA500', borderRadius: 4 },
        { data: [], label: 'DPO',              backgroundColor: '#4CAF50', borderRadius: 4},
      ]
    };
    this.districtwiseTrendLabels = [];
    this.districtwiseTrendChartData = {
      labels: [],
      datasets: [{
        data: [],
        label: 'Compliance %',
        backgroundColor: '#4CAF50',
        hoverBackgroundColor: '#388E3C',
        borderRadius: 6,
        barThickness: 30,
      }]
    };
    this.tableData = [];
  }

  // ─── Chart Download ──────────────────────────────────────
  downloadChart(canvasId: string, filename: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  }

  // ─── Load Metrics ────────────────────────────────────────
    private loadMetrics(): void {
  this.isLoadingMetrics = true;
  this.service.getHcmInspectionMetrics(
    this.selectedYear, this.selectedMonth,
    this.selectedDistrict, this.selectedBlock,
    this.selectedSector, this.selectedUser
  ).subscribe({
    next: (res) => {
      const d = res?.data;
      if (d) {
        const indicators = [
          d.stock_match,
          d.food_storage,
          d.expired_disposal,
          d.egg_quality,
          d.food_quality,
          d.register_update,   // ← note: API uses register_update (no 'd')
        ].filter(v => v !== null && v !== undefined);

        const overall = indicators.length
          ? indicators.reduce((sum, v) => sum + v, 0) / indicators.length
          : 0;

        this.metricsData = { ...d, overall_compliance: parseFloat(overall.toFixed(2)) };
      }
      this.isLoadingMetrics = false;
    },
    error: () => { this.isLoadingMetrics = false; }
  });
}

  // ─── Load Month-wise Trend ───────────────────────────────
  private loadMonthwiseTrend(): void {
    this.isLoadingMonthwise = true;
    this.service.getHcmMonthwiseTrend(
      this.selectedYear, this.selectedMonth,
      this.selectedDistrict, this.selectedBlock,
      this.selectedSector, this.selectedUser,
      this.selectedIndicator
    ).subscribe({
      next: (res) => {
        this.buildMonthwiseChart(res?.data?.formattedData || []);
        this.isLoadingMonthwise = false;
      },
      error: () => { this.isLoadingMonthwise = false; }
    });
  }

   private buildMonthwiseChart(data: any[]): void {
        if (!data?.length) return;

        const selected = this.indicatorOptions.find(i => i.value === this.selectedIndicator);
        this.monthwiseTrendLabels = data.map(d => d.year_month);

        this.monthwiseTrendChartData = {
          labels: [...this.monthwiseTrendLabels],
          datasets: [
            {
              data: data.map(d => parseFloat(d.value ?? d[this.selectedIndicator] ?? 0)),  // ← fix
              label: selected?.label || 'Compliance',
              borderColor: '#5D87FF',
              backgroundColor: 'rgba(93,135,255,0.15)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#5D87FF',
              pointRadius: 5,
              pointHoverRadius: 7,
            }
          ]
        };
      }

  // ─── Load User-wise Trend ────────────────────────────────
  private loadUserwiseTrend(): void {
  this.isLoadingUserwise = true;
  this.service.getHcmUserwiseTrend(
    this.selectedYear, this.selectedMonth,
    this.selectedDistrict, this.selectedBlock,
    this.selectedSector, this.selectedUserwiseToggle
  ).subscribe({
    next: (res) => {
      this.buildUserwiseChart(res?.data?.data || {});  
      this.isLoadingUserwise = false;
    },
    error: () => { this.isLoadingUserwise = false; }
  });
}

  private buildUserwiseChart(data: Record<string, { supervisor: number; cdpo: number; dpo: number }>): void {
  const keys = Object.keys(data);
  if (!keys.length) return;

  // Use indicator label from indicatorOptions if available, else format the key
  this.userwiseTrendLabels = keys.map(k => {
    const match = this.indicatorOptions.find(o => o.value === k);
    return match ? match.label : k.replace(/_/g, ' ').toUpperCase();
  });

  this.userwiseTrendChartData = {
    labels: [...this.userwiseTrendLabels],
    datasets: [
      {
        data: keys.map(k => data[k].supervisor ?? 0),
        label: 'Block Supervisor',
        backgroundColor: '#5D87FF',
        borderRadius: 4,
        // barThickness: 14
      },
      {
        data: keys.map(k => data[k].cdpo ?? 0),
        label: 'CDPO',
        backgroundColor: '#FFA500',
        borderRadius: 4,
        // barThickness: 14
      },
      {
        data: keys.map(k => data[k].dpo ?? 0),
        label: 'DPO',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
        // barThickness: 14
      }
    ]
  };
}

  // ─── Load District-wise Trend ─────────────────────────────
  // private loadDistrictwiseTrend(): void {
  //   this.isLoadingDistrictwise = true;
  //   this.service.getHcmDistrictwiseTrend(
  //     this.selectedYear, this.selectedMonth,
  //     this.selectedDistrict, this.selectedBlock,
  //     this.selectedSector, this.selectedDistrictwiseToggle
  //   ).subscribe({
  //     next: (res) => {
  //       this.buildDistrictwiseChart(res?.data || []);
  //       this.isLoadingDistrictwise = false;
  //     },
  //     error: () => { this.isLoadingDistrictwise = false; }
  //   });
  // }

  // private buildDistrictwiseChart(data: any[]): void {
  //   if (!data?.length) return;
  //   this.districtwiseTrendLabels = data.map(d =>
  //     (d.name || d.district || '').toUpperCase()
  //   );
  //   this.districtwiseTrendChartData = {
  //     labels: [...this.districtwiseTrendLabels],
  //     datasets: [{
  //       data: data.map(d => parseFloat(d.percentage || d.overall_compliance || 0)),
  //       label: 'Compliance %',
  //       backgroundColor: data.map(d => {
  //         const val = parseFloat(d.percentage || d.overall_compliance || 0);
  //         return val >= 90 ? '#4CAF50' : val >= 70 ? '#FFA500' : '#E53935';
  //       }),
  //       hoverBackgroundColor: '#388E3C',
  //       borderRadius: 6,
  //       barThickness: 30,
  //     }]
  //   };
  // }

  // ─── Load Hierarchical Table Data ────────────────────────
  private loadHierarchicalData(): void {
  this.isLoading = true;
   const userFilter = this.selectedTableUserType || this.selectedUser;
  this.service.getHcmHierarchicalData(
    this.selectedYear, this.selectedMonth,
    this.selectedDistrict, this.selectedBlock,
    this.selectedSector,userFilter
  ).subscribe({
    next: (res) => {
      const raw = res?.data || [];                          // ← direct array, not data.formattedData
      this.tableData = raw.map((d: any) => ({
        slNo:               d.sl_no,
        id:                 d.group_id,
        name:               d.group_name,
        total_inspections:  d.awcs_available,               // ← was d.total_inspections
        awcs_inspected:     d.awcs_observed,                // ← was d.awcs_inspected
        overall_compliance: d.overall_compliance,
        stock_match:        d.stock_match,
        food_storage:       d.food_storage,
        expired_disposal:   d.expired_disposal,
        egg_quality:        d.egg_quality,
        register_updated:   d.register_updated,
        food_quality:       d.food_quality,
      }));
      this.updateChartConfig();
      this.isLoading = false;
    },
    error: () => { this.isLoading = false; }
  });
}

  // ─── Update Chart Config ─────────────────────────────────
  updateChartConfig(): void {
    const selected = this.indicatorOptions.find(i => i.value === this.selectedIndicator);
    this.chartConfig = {
      enabled: true,
      enableSort: true,
      labelColumnKey: 'name',
      dataColumnKey: this.selectedIndicator,
      chartLabel: selected?.label || '',
      chartFileName: 'hcm-inspection.png',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 110, title: { display: true, text: '% Compliance' } }
        }
      }
    };
  }

  onTableUserTypeChange(value: string): void {
  this.selectedTableUserType = value;
  this.loadHierarchicalData();
}

  // ─── View Toggle ─────────────────────────────────────────
  onViewToggle(tabIndex: any): void {
    this.isChartView = tabIndex === 1;
  }

  // ─── Indicator Change ────────────────────────────────────
  onIndicatorChange(value: string): void {
    this.selectedIndicator = value;
    this.loadMonthwiseTrend();
    this.updateChartConfig();
  }

  // ─── Prepare Table/Chart JSON Config ─────────────────────
  private prepareJson(): void {
    this.tableData = [];

    const commonColumns: TableColumn[] = [
      { key: 'slNo',               label: 'Sl.No',                    sortable: true, align: 'left' },
      { key: 'total_inspections',  label: 'Total AWC`s',         align: 'left', total: true },
      { key: 'awcs_inspected',     label: 'AWCs Inspected',            align: 'left', total: true },
      { key: 'overall_compliance', label: 'Overall Compliance (%)',    suffix: '%', average: true, weightKey: 'awcs_inspected' },
      { key: 'stock_match',        label: 'Stock Match (%)',           suffix: '%', average: true, weightKey: 'awcs_inspected' },
      { key: 'food_storage',       label: 'Food Storage (%)',          suffix: '%', average: true, weightKey: 'awcs_inspected' },
      { key: 'expired_disposal',   label: 'Expired Disposal (%)',      suffix: '%', average: true, weightKey: 'awcs_inspected' },
      { key: 'egg_quality',        label: 'Egg Quality (%)',           suffix: '%', average: true, weightKey: 'awcs_inspected' },
      { key: 'register_updated',   label: 'Register Updated (%)',      suffix: '%', average: true, weightKey: 'awcs_inspected' },
      { key: 'food_quality',       label: 'Food Quality (%)',          suffix: '%', average: true, weightKey: 'awcs_inspected' },
    ];

    if (this.selectedBlock && this.selectedDistrict) {
      this.headerConfig.title = 'Sector wise % of HCM Inspection Compliance';
      this.headerConfig.sectionType = 'Sector';
      this.tableConfig = {
        enableSearch: true, showFooter: true,
        columns: [
          ...commonColumns.slice(0, 1),
          { key: 'name', label: 'Sector Name', clickable: true, totalLabel: true },
          ...commonColumns.slice(1)
        ]
      };
    } else if (this.selectedDistrict && !this.selectedBlock) {
      this.headerConfig.title = 'Block wise % of HCM Inspection Compliance';
      this.headerConfig.sectionType = 'Block';
      this.tableConfig = {
        enableSearch: true, showFooter: true,
        columns: [
          ...commonColumns.slice(0, 1),
          { key: 'name', label: 'Block Name', clickable: true, totalLabel: true },
          ...commonColumns.slice(1)
        ]
      };
    } else {
      this.headerConfig.title = 'District wise % of HCM Inspection Compliance';
      this.headerConfig.sectionType = 'District';
      this.tableConfig = {
        enableSearch: true, showFooter: true,
        columns: [
          ...commonColumns.slice(0, 1),
          { key: 'name', label: 'District Name', clickable: true, totalLabel: true },
          ...commonColumns.slice(1)
        ]
      };
    }

    this.updateChartConfig();
  }

  // ─── Row Click → Excel Download ──────────────────────────
  onRowClick(row: any): void {
    const year  = this.selectedYear;
    const month = this.selectedMonth;

    if (this.selectedBlock && this.selectedDistrict) {
      this.service.hcmExcelDownload(
        this.selectedDistrict, year, month,
        row?.id,
        this.selectedBlock,
        this.selectedUser
      ).subscribe({
        next: (res: Blob) => this.triggerDownload(res, `Sector_HCM_${row.name}_${month}-${year}.xlsx`),
        error: (err) => console.error('Sector Excel error:', err)
      });
    } else if (this.selectedDistrict && !this.selectedBlock) {
      this.service.hcmExcelDownload(
        this.selectedDistrict, year, month,
        undefined,
        row?.id,
        this.selectedUser
      ).subscribe({
        next: (res: Blob) => this.triggerDownload(res, `Block_HCM_${row.name}_${month}-${year}.xlsx`),
        error: (err) => console.error('Block Excel error:', err)
      });
    } else {
      this.service.hcmExcelDownload(
        row?.id,
        year, month,
        undefined, undefined,
        this.selectedUser
      ).subscribe({
        next: (res: Blob) => this.triggerDownload(res, `District_HCM_${row.name}_${month}-${year}.xlsx`),
        error: (err) => console.error('District Excel error:', err)
      });
    }
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ─── Toggle Handlers ─────────────────────────────────────
  onUserwiseToggle(value: string): void {
    this.selectedUserwiseToggle = value;
    this.loadUserwiseTrend();
  }

  onDistrictwiseToggle(value: string): void {
    this.selectedDistrictwiseToggle = value;
    // this.loadDistrictwiseTrend();
  }

  // ─── Filter Handlers ─────────────────────────────────────
  onFilterChange(): void {
    this.updateHeaderTitle();
    this.loadDashboardData();
  }

  onUserChange(event: any): void {
    this.selectedUser = event.value;
    this.loadDashboardData();
  }

  onDistrictChange(val: any): void {
    this.blockData = [];
    this.sectorData = [];
    this.selectedBlock = '';
    this.selectedSector = '';
    this.clearAllData();
    this.updateHeaderTitle();
    if (this.selectedDistrict) this.loadBlockData(this.selectedDistrict);
    this.loadDashboardData();
  }

  onBlockChange(): void {
    this.sectorData = [];
    this.selectedSector = '';
    this.clearAllData();
    this.updateHeaderTitle();
    if (this.selectedBlock) this.loadSectorData(this.selectedBlock);
    this.loadDashboardData();
  }

  clearFilters(): void {
    if (this.isStateUser)    { this.selectedDistrict = ''; this.selectedBlock = ''; }
    if (this.isDistrictUser) { this.selectedBlock = ''; }
    this.updateHeaderTitle();
    this.loadDashboardData();
  }

  private updateHeaderTitle(): void {
    if (this.selectedSector) {
      this.headerTitle = 'ICDS - HCM Inspection (CDPO)';
    } else if (this.selectedBlock || this.selectedDistrict) {
      this.headerTitle = 'ICDS - HCM Inspection (DPO)';
    } else {
      this.headerTitle = 'ICDS - HCM Inspection (State)';
    }
  }

  // ─── Data Loaders ─────────────────────────────────────────
  loadDistrictData(): void {
    const payload: any = {
      filter: { is_active: true },
      options: { sortBy: { district_name: 'asc' } }
    };
    if (this.isDistrictUser || this.isBlockUser) payload.filter.district_id = this.user.district_id;
    this.isLoading = true;
    this.service.postDistrictDatWithFilter(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.districtData = res?.data?.result;
        if (this.isDistrictUser || this.isBlockUser) {
          this.selectedDistrict = this.districtData[0]?.district_id;
          this.loadBlockData(this.selectedDistrict);
        }
        if (this.isDistrictUser) this.loadDashboardData();
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadBlockData(districtId: string): void {
    this.isLoading = true;
    const filter: any = {};
    if (this.isDistrictUser || this.isBlockUser) {
      filter.district_id = this.user.district_id;
      if (this.isBlockUser) filter.block_id = this.user.block_id;
    }
    if (districtId) filter.district_id = districtId;
    this.service.postBlockDataWithFilter(filter).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.blockData = res?.data?.result?.sort((a: any, b: any) =>
          a.block_name.localeCompare(b.block_name)
        );
        if (this.isBlockUser) {
          this.selectedDistrict = this.districtData[0]?.district_id;
          this.selectedBlock    = this.blockData[0]?.block_id;
          this.loadDashboardData();
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadSectorData(blockId: string): void {
    this.isLoading = true;
    this.service.postSectorData(blockId).subscribe({
      next: (res) => {
        this.isLoading  = false;
        this.sectorData = res?.data?.result;
        this.loadDashboardData();
      },
      error: () => { this.isLoading = false; }
    });
  }
}