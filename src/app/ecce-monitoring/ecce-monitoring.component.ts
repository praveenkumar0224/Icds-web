import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableConfig } from '../common/dynamic-table-chart/dynamic-table-chart.model';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-ecce-monitoring',
  templateUrl: './ecce-monitoring.component.html',
  styleUrls: ['./ecce-monitoring.component.scss']
})
export class EcceMonitoringComponent implements OnInit, OnDestroy {

  // ─── Page Meta ─────────────────────────────────────────
  headerTitle = 'ICDS - ECCE Monitoring (State)';

  // ─── Role / Access ──────────────────────────────────────
  localUser = localStorage.getItem('user');
  user = JSON.parse(this.localUser || '{}');
  role = this.user?.role?.role_name;

  isAccess = true;
  isStateUser = false;
  isDistrictUser = false;
  isBlockUser = false;

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

  users: string[] = [];
  selectedUser = 'Block Supervisor';

  // ─── Loading flags ──────────────────────────────────────
  isLoading = false;
  isLoadingMetrics = false;
  isLoadingMonthwise = false;
  isLoadingUserwise = false;
  isLoadingDistrictwise = false;

  // ─── Metrics ────────────────────────────────────────────
  metricsData: any = null;


    // ─── Metrics Data (one field per card) ─────────────────────────────────────
awcsObserved: any = null;
totalChildrenAssessed: any = null;
averageAssessmentScore: any = null;
childrenAbove8Letters: any = null;
childrenBelow4Letters: any = null;

// ─── Loading flags per card ─────────────────────────────────────────────────
isLoadingAwcsObserved = false;
isLoadingTotalChildren = false;
isLoadingAvgScore = false;
isLoadingAbove8 = false;
isLoadingBelow4 = false;

  // ─── Labels ─────────────────────────────────────────────
  labelChanges = {
    monthwiseTrendChart: 'Month-wise Trend',
    userwiseTrendChart: 'User-wise Trend',
    districtwiseTrendChart: 'District-wise Trend',
  };

  // ─── Toggle Options ─────────────────────────────────────
  userwiseToggleOptions = [
    { label: 'All', value: 'all' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'CDPO', value: 'cdpo' },
    { label: 'DPO', value: 'dpo' },
  ];
  selectedUserwiseToggle = 'all';

  districtwiseToggleOptions = [
    { label: 'All', value: 'all' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'CDPO', value: 'cdpo' },
    { label: 'DPO', value: 'dpo' },
  ];
  selectedDistrictwiseToggle = 'all';

  // ─── Month-wise Trend Chart ─────────────────────────────
  monthwiseTrendLabels: string[] = [];
  monthwiseTrendChartData: ChartData<'bar'> = {
  labels: [],
  datasets: [
    { data: [], label: 'Avg Assessment Score', backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
    { data: [], label: 'Total Children Assessed', backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
  ]
};

  // ─── User-wise Trend Chart ──────────────────────────────
  userwiseTrendLabels: string[] = [];
  userwiseTrendChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Supervisor', backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'CDPO',       backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'DPO',        backgroundColor: '#4CAF50', borderRadius: 4, barThickness: 14 },
    ]
  };

  // ─── District-wise Trend Chart ──────────────────────────
  districtwiseTrendLabels: string[] = [];
  districtwiseTrendChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Compliance %',
        backgroundColor: '#5D87FF',
        hoverBackgroundColor: '#4a6cd8',
        borderRadius: 6,
        barThickness: 30,
      }
    ]
  };

  // ─── Shared Chart Options ───────────────────────────────
    groupedBarChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
    datalabels: {
      display: true,
      anchor: 'end',
      align: 'end',
      rotation: -90,           // ← add this line to rotate labels vertical
      formatter: (value: number) => value > 0 ? value.toFixed(1) + '%' : '',
      font: { size: 10, weight: 'bold' },
      color: 'black',
      clamp: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 120,                // ← increase from 110 to 120 to give more room for rotated labels
      ticks: {
        stepSize: 25,
        callback: (v: any) => v <= 100 ? v + '%' : ''
      },
      title: { display: true, text: 'Compliance →' }
    }
  }
};

     districtBarChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: {
      display: true,
      anchor: 'end',        // ← center inside the bar
      align: 'end',         // ← center inside the bar
      formatter: (value: number) => value > 0 ? value.toFixed(1) + '%' : '',
      font: { size: 13, weight: 'bold' },
      color: 'black',        // ← explicit hex white, not string 'white'
      clamp: true,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 110,                // ← was 100, bars at 100 were clipping the label
      ticks: {
        callback: (v: any) => v <= 100 ? v : ''   // ← hides 110 tick
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
    title: 'District wise % of ECCE Monitoring Compliance',
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
    dataColumnKey: 'percentage',
    chartLabel: 'Compliance %',
    chartFileName: 'ecce-monitoring.png',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: '% Compliance' } }
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
    // this.onBlockChange();
  }

  // ─── Main Dashboard Load ─────────────────────────────────
  loadDashboardData(): void {
    this.clearAllData();
    this.prepareJson();
          this.loadMonitoringMetrics();
    this.loadMonthwiseTrend();
    this.loadUserwiseTrend();
    this.loadDistrictwiseTrend();
    this.loadHierarchicalData();
  }
  

  private clearAllData(): void {
  //   this.metricsData = null;
    this.awcsObserved = null;
  this.totalChildrenAssessed = null;
  this.averageAssessmentScore = null;
  this.childrenAbove8Letters = null;
  this.childrenBelow4Letters = null;
    this.monthwiseTrendLabels = [];
     this.monthwiseTrendChartData = {
        labels: [],
        datasets: [
          { data: [], label: 'Avg Assessment Score',     backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
          // { data: [], label: 'Total Children Assessed',  backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
        ]
      };
    this.userwiseTrendLabels = [];
    this.userwiseTrendChartData = {
      labels: [],
      datasets: [
        { data: [], label: 'Supervisor', backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
        { data: [], label: 'CDPO',       backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
        { data: [], label: 'DPO',        backgroundColor: '#4CAF50', borderRadius: 4, barThickness: 14 },
      ]
    };
    this.districtwiseTrendLabels = [];
    this.districtwiseTrendChartData = {
      labels: [],
      datasets: [{
        data: [],
        label: 'Compliance %',
        backgroundColor: '#5D87FF',
        hoverBackgroundColor: '#4a6cd8',
        borderRadius: 6,
        barThickness: 30,
      }]
    };
    this.tableData = [];
     console.log('CLEARING DATA');
  }

    downloadChart(canvasId: string, filename: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  }

  // ─── Load Metrics ────────────────────────────────────────
   private loadMonitoringMetrics(): void {
  const args: [string, string, string, string, string, string] = [
    this.selectedYear, this.selectedMonth,
    this.selectedDistrict, this.selectedBlock,
    this.selectedSector, this.selectedUser
  ];

  this.isLoadingAwcsObserved = true;
  this.service.getEcceMonitoringAwcsObserved(...args).subscribe({
    next: (res) => { this.awcsObserved = res?.data;console.log(res?.data, "awcsObserved response");
     ;this.isLoadingAwcsObserved = false; },
    error: () => { this.isLoadingAwcsObserved = false; }
  });

  console.log(this.awcsObserved, "awcsObserved");
  

  this.isLoadingTotalChildren = true;
  this.service.getEcceMonitoringTotalChildrenAssessed(...args).subscribe({
    next: (res) => { this.totalChildrenAssessed = res?.data; this.isLoadingTotalChildren = false; },
    error: () => { this.isLoadingTotalChildren = false; }
  });

  this.isLoadingAvgScore = true;
  this.service.getEcceMonitoringAverageAssessmentScore(...args).subscribe({
    next: (res) => { this.averageAssessmentScore = res?.data; this.isLoadingAvgScore = false; },
    error: () => { this.isLoadingAvgScore = false; }
  });

  this.isLoadingAbove8 = true;
  this.service.getEcceMonitoringChildrenAbove8Letters(...args).subscribe({
    next: (res) => { this.childrenAbove8Letters = res?.data; this.isLoadingAbove8 = false; },
    error: () => { this.isLoadingAbove8 = false; }
  });

  this.isLoadingBelow4 = true;
  this.service.getEcceMonitoringChildrenBelow4Letters(...args).subscribe({
    next: (res) => { this.childrenBelow4Letters = res?.data; this.isLoadingBelow4 = false; },
    error: () => { this.isLoadingBelow4 = false; }
  });

  console.log('LOADING METRICS');
}
    get isAnyLoading(): boolean {
  return this.isLoading ||
         this.isLoadingMonthwise ||
         this.isLoadingUserwise ||
         this.isLoadingDistrictwise ||
         this.isLoadingAwcsObserved ||
         this.isLoadingTotalChildren ||
         this.isLoadingAvgScore ||
         this.isLoadingAbove8 ||
         this.isLoadingBelow4;
}

  // ─── Load Month-wise Trend ───────────────────────────────
  private loadMonthwiseTrend(): void {
    this.isLoadingMonthwise = true;
    this.service.getEcceMonitoringMonthwiseTrend(
      this.selectedYear, this.selectedMonth,
      this.selectedDistrict, this.selectedBlock,
      this.selectedSector, this.selectedUser
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

        this.monthwiseTrendLabels = data.map(d => d.year_month);  // e.g. "Mar-2026"

        this.monthwiseTrendChartData = {
          labels: [...this.monthwiseTrendLabels],
          datasets: [
            {
              data: data.map(d => parseFloat(d.average_assessment_score || 0)),
              label: 'Avg Assessment Score',
              backgroundColor: '#5D87FF',
              borderRadius: 4,
              barThickness: 14
            },
            // {
            //   data: data.map(d => parseFloat(d.total_children_assessed || 0)),
            //   label: 'Total Children Assessed',
            //   backgroundColor: '#FF6B6B',
            //   borderRadius: 4,
            //   barThickness: 14
            // },
          ]
        };
      }

  // ─── Load User-wise Trend ────────────────────────────────
  private loadUserwiseTrend(): void {
    this.isLoadingUserwise = true;
    this.service.getEcceMonitoringUserwiseTrend(
      this.selectedYear, this.selectedMonth,
      this.selectedDistrict, this.selectedBlock,
      this.selectedSector, this.selectedUser
    ).subscribe({
      next: (res) => {
        this.buildUserwiseChart(res?.data?.formattedData || []);
        this.isLoadingUserwise = false;
      },
      error: () => { this.isLoadingUserwise = false; }
    });
  }

    private buildUserwiseChart(data: any[]): void {

        if (!data?.length) return;

        this.userwiseTrendLabels = data.map(
          d => d.category?.replaceAll('_', ' ').toUpperCase()
        );

        this.userwiseTrendChartData = {
          labels: [...this.userwiseTrendLabels],

          datasets: [

            {
              data: data.map(d => Number(d.supervisor || 0)),
              label: 'Supervisor',
              backgroundColor: '#5D87FF',
              borderRadius: 4,
              barThickness: 14
            },

            {
              data: data.map(d => Number(d.cdpo || 0)),
              label: 'CDPO',
              backgroundColor: '#FF6B6B',
              borderRadius: 4,
              barThickness: 14
            },

            {
              data: data.map(d => Number(d.dpo || 0)),
              label: 'DPO',
              backgroundColor: '#4CAF50',
              borderRadius: 4,
              barThickness: 14
            }

          ]
        };
      }

  // ─── Load District-wise Trend ─────────────────────────────
  private loadDistrictwiseTrend(): void {
    this.isLoadingDistrictwise = true;
    this.service.getEcceMonitoringDistrictwiseTrend(
      this.selectedYear, this.selectedMonth,
      this.selectedDistrict, this.selectedBlock,
      this.selectedSector, this.selectedDistrictwiseToggle
    ).subscribe({
      next: (res) => {
        this.buildDistrictwiseChart(res?.data || []);
        this.isLoadingDistrictwise = false;
      },
      error: () => { this.isLoadingDistrictwise = false; }
    });
  }

  private buildDistrictwiseChart(data: any[]): void {
    if (!data?.length) return;
    this.districtwiseTrendLabels = data.map(d => d.name?.toUpperCase() || d.district?.toUpperCase());
    this.districtwiseTrendChartData = {
      labels: [...this.districtwiseTrendLabels],
      datasets: [{
        data: data.map(d => parseFloat(d.percentage || 0)),
        label: 'Compliance %',
        backgroundColor: '#5D87FF',
        hoverBackgroundColor: '#4a6cd8',
        borderRadius: 6,
        barThickness: 30,
      }]
    };
  }

  // ─── Load Hierarchical Table Data ────────────────────────
  private loadHierarchicalData(): void {
    this.isLoading = true;
    this.service.getEcceMonitoringHierarchicalData(
      this.selectedYear, this.selectedMonth,
      this.selectedDistrict, this.selectedBlock,
      this.selectedSector, this.selectedUser
    ).subscribe({
      next: (res) => {
        this.tableData = res?.data?.formattedData || [];
         console.log("table dataa response", this.tableData);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

   
    
  }

  // ─── Prepare Table/Chart JSON Config ─────────────────────
     private prepareJson(): void {
  // this.tableData = [];

  // Dynamic heading
  if (this.selectedBlock && this.selectedDistrict) {
    this.headerConfig.title = 'Sector wise ECCE Monitoring';
    this.headerConfig.sectionType = 'Sector';
  } else if (this.selectedDistrict && !this.selectedBlock) {
    this.headerConfig.title = 'Block wise ECCE Monitoring';
    this.headerConfig.sectionType = 'Block';
  } else {
    this.headerConfig.title = 'District wise ECCE Monitoring';
    this.headerConfig.sectionType = 'District';
  }

    const sectionLabel = `${this.headerConfig.sectionType} Name`;
    console.log('PREPARING JSON with section label:', sectionLabel);
    

  // TABLE CONFIG
  this.tableConfig = {
    enableSearch: true,
    showFooter: true,
    columns: [
      {
        key: 'sl_no',
        label: 'Sl.No',
        sortable: true,
        align: 'left'
      },
      {
        key: 'group_name',
        label: (this.selectedBlock && this.selectedDistrict) ? 'Sector Name' : (this.selectedDistrict && !this.selectedBlock) ? 'Block Name' : 'District Name',
        clickable: true,
        totalLabel: true
      },
      {
        key: 'awcs_available',
        label: 'AWCs Available',
        align: 'left',
        total: true
      },
      {
        key: 'awcs_observed',
        label: 'AWCs Observed',
        align: 'left',
        total: true
      },
      {
        key: 'total_children_assessed',
        label: 'Children Assessed',
        align: 'left',
        total: true
      },
      {
        key: 'average_assessment_score',
        label: 'Avg Assessment Score',
        align: 'left',
        average: true,
        suffix: '%',
        weightKey: 'awcs_observed' 
      },
      {
        key: 'more_than_eight',
        label: '> 8 Letters (%)',
        suffix: '%',
        average: true,
        weightKey: 'awcs_observed'
      },
      {
        key: 'four_to_seven',
        label: '4 - 7 Letters (%)',
        suffix: '%',
        average: true,
        weightKey: 'awcs_observed'
      },
      {
        key: 'less_than_four',
        label: '< 4 Letters (%)',
        suffix: '%',
        average: true,
        weightKey: 'awcs_observed'
      }
    ]
  };

  // CHART CONFIG
  this.chartConfig = {
    enabled: true,
    enableSort: true,

    // X axis label
    labelColumnKey: 'group_name',

    // Y axis value
    dataColumnKey: 'average_assessment_score',
    chartLabel: 'Average Assessment Score',
    chartFileName: 'ecce-monitoring.png',

    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: 'Average Score'
          }
        }
      }
    }
  };
}


  // ─── Row Click → Excel Download ──────────────────────────
    onRowClick(row: any): void {
  const year  = this.selectedYear;
  const month = this.selectedMonth;

  if (this.selectedBlock && this.selectedDistrict) {
    // Filter: district + block → user clicks sector row
    // Payload: district_id + block_id + sector_id
    this.service.ecceMonitoringExcelDownload(
      this.selectedDistrict, year, month,
      row?.group_id,          // sector_id from row
      this.selectedBlock,     // block_id from filter
      this.selectedUser
    ).subscribe({
      next: (res: Blob) => this.triggerDownload(res, `Sector_ECCEMonitoring_${row.group_name}_${month}-${year}.xlsx`),
      error: (err) => console.error('Sector Excel error:', err)
    });

  } else if (this.selectedDistrict && !this.selectedBlock) {
    // Filter: district selected → user clicks block row
    // Payload: district_id + block_id
    this.service.ecceMonitoringExcelDownload(
      this.selectedDistrict, year, month,
      undefined,              // no sector
      row?.group_id,          // block_id from row
      this.selectedUser
    ).subscribe({
      next: (res: Blob) => this.triggerDownload(res, `Block_ECCEMonitoring_${row.group_name}_${month}-${year}.xlsx`),
      error: (err) => console.error('Block Excel error:', err)
    });

  } else {
    // No filter → user clicks district row
    // Payload: district_id only
    this.service.ecceMonitoringExcelDownload(
      row?.group_id,          // district_id from row
      year, month,
      undefined, undefined,
      this.selectedUser
    ).subscribe({
      next: (res: Blob) => this.triggerDownload(res, `District_ECCEMonitoring_${row.group_name}_${month}-${year}.xlsx`),
      error: (err) => console.error('District Excel error:', err)
    });
  }
}


  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
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
    this.loadDistrictwiseTrend();
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

        this.updateHeaderTitle();

        if (this.selectedDistrict) {
          this.loadBlockData(this.selectedDistrict);
          this.loadDashboardData(); 
        } else {
          this.loadDashboardData();
        }
      }

     onBlockChange(): void {
        this.sectorData = [];
        this.selectedSector = '';

        this.updateHeaderTitle();

        if (this.selectedBlock) {
          this.loadSectorData(this.selectedBlock);
        } else {
          this.loadDashboardData();
        }
      }

  clearFilters(): void {
    if (this.isStateUser)    { this.selectedDistrict = ''; this.selectedBlock = ''; }
    if (this.isDistrictUser) { this.selectedBlock = ''; }
    this.updateHeaderTitle();
    this.loadDashboardData();
  }

  private updateHeaderTitle(): void {
    if (this.selectedSector) {
      this.headerTitle = 'ICDS - ECCE Monitoring (CDPO)';
    } else if (this.selectedBlock || this.selectedDistrict) {
      this.headerTitle = 'ICDS - ECCE Monitoring (DPO)';
    } else {
      this.headerTitle = 'ICDS - ECCE Monitoring (State)';
    }
  }

  // ─── Data Loaders (District / Block / Sector) ─────────────
  loadDistrictData(): void {
    const payload: any = {
      filter: { is_active: true },
      options: { sortBy: { district_name: 'asc' } }
    };
    if (this.isDistrictUser || this.isBlockUser) payload.filter.district_id = this.user.district_id;
    this.isLoading = true;
    this.service.postDistrictDatWithFilter(payload).subscribe({
      next: (res) => {
        this.isLoading    = false;
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