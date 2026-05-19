import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableConfig,TableColumn } from '../common/dynamic-table-chart/dynamic-table-chart.model';


@Component({
  selector: 'app-ecce-observation',
  templateUrl: './ecce-observation.component.html',
  styleUrls: ['./ecce-observation.component.scss']
})
export class EcceObservationComponent implements OnInit, OnDestroy {

  // ─── Page Meta ─────────────────────────────────────────
  headerTitle = 'ICDS - ECCE Observation (State)';

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

  users: string[] = ['Block Supervisor', 'CDPO', 'DPO'];
  selectedUser = 'Block Supervisor';

  metricOptions = [
  { label: 'Preschool Sessions Held',  value: 'preschool_sessions_held' },
  { label: 'Theme Based Teaching',     value: 'theme_based_teaching' },
  { label: 'Playkit Usage',            value: 'playkit_usage' },
  { label: 'Workbook Completion',      value: 'workbook_completion' },
  { label: 'Assessment Card Update',   value: 'assessment_card_update' },
];
selectedMetric = 'preschool_sessions_held';

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
      { data: [], label: 'Pre School Session', backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Theme Based Teaching', backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Playkit Usage', backgroundColor: '#4CAF50', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Workbook Completion', backgroundColor: '#FF9800', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Assessment Card Update', backgroundColor: '#9C27B0', borderRadius: 4, barThickness: 14 }
    ]
  };

  // ─── User-wise Trend Chart ──────────────────────────────
  userwiseTrendLabels: string[] = [];
  userwiseTrendChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Supervisor', backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'CDPO', backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'DPO', backgroundColor: '#4CAF50', borderRadius: 4, barThickness: 14 },
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
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Compliance →' }
      },
      x: {
        title: { display: true, text: 'Month →' }
      }
    }
  };

  districtBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Compliance →' }
      },
      x: {
        title: { display: true, text: 'Districts →' }
      }
    }
  };

  // ─── Table / Chart Config ───────────────────────────────
  headerConfig = {
    title: "District wise % of ECCE Observation Compliance",
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
    chartFileName: 'ecce-observation.png',
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
        break;
      case 'CDPO':
        this.isBlockUser = true;
        break;
      case 'Block Supervisor':
        this.isAccess = false;
        break;
      case 'Root':
      case 'Zone Officer':
        this.isStateUser = true;
        break;
      default:
        this.isAccess = true;
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
      this.onDistrictChange(null);
    }
    // this.onBlockChange();
  }

  // ─── Main Dashboard Load ─────────────────────────────────
  loadDashboardData(): void {
    this.clearAllData();
    this.prepareJson();
    this.loadMetrics();
    this.loadMonthwiseTrend();
    this.loadUserwiseTrend();
    this.loadDistrictwiseTrend();
    this.loadHierarchicalData();
  }

  private clearAllData(): void {
    this.metricsData = null;
    this.monthwiseTrendLabels = [];
    this.monthwiseTrendChartData = { labels: [], datasets: [
      { data: [], label: 'Pre School Session', backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Theme Based Teaching', backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Playkit Usage', backgroundColor: '#4CAF50', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Workbook Completion', backgroundColor: '#FF9800', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'Assessment Card Update', backgroundColor: '#9C27B0', borderRadius: 4, barThickness: 14 }
    ]};
    this.userwiseTrendLabels = [];
    this.userwiseTrendChartData = { labels: [], datasets: [
      { data: [], label: 'Supervisor', backgroundColor: '#5D87FF', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'CDPO', backgroundColor: '#FF6B6B', borderRadius: 4, barThickness: 14 },
      { data: [], label: 'DPO', backgroundColor: '#4CAF50', borderRadius: 4, barThickness: 14 },
    ]};
    this.districtwiseTrendLabels = [];
    this.districtwiseTrendChartData = { labels: [], datasets: [{
      data: [], label: 'Compliance %', backgroundColor: '#5D87FF',
      hoverBackgroundColor: '#4a6cd8', borderRadius: 6, barThickness: 30,
    }]};
    this.tableData = [];
  }

  // ─── Load Metrics ────────────────────────────────────────
  private loadMetrics(): void {
    this.isLoadingMetrics = true;
    this.service.getEcceObservationMetrics(
      this.selectedYear, this.selectedMonth,
      this.selectedDistrict, this.selectedBlock,
      this.selectedSector, this.selectedUser
    ).subscribe({
      next: (res) => {
        this.metricsData = res?.data;
        this.isLoadingMetrics = false;
      },
      error: () => { this.isLoadingMetrics = false; }
    });
  }

  // ─── Load Month-wise Trend ───────────────────────────────
  private loadMonthwiseTrend(): void {
    this.isLoadingMonthwise = true;
    this.service.getEcceMonthwiseTrend(
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

        this.monthwiseTrendLabels = data.map(d => d.year_month);  // ← "Mar-2026"

        this.monthwiseTrendChartData = {
          labels: [...this.monthwiseTrendLabels],
          datasets: [
            {
              data: data.map(d => parseFloat(d.preschool_session_held || 0)),
              label: 'Pre School Session',
              backgroundColor: '#5D87FF',
              borderRadius: 4,
              barThickness: 14
            },
            {
              data: data.map(d => parseFloat(d.theme_based_teaching || 0)),
              label: 'Theme Based Teaching',
              backgroundColor: '#FF6B6B',
              borderRadius: 4,
              barThickness: 14
            },
            {
              data: data.map(d => parseFloat(d.playkit_usage || 0)),
              label: 'Playkit Usage',
              backgroundColor: '#4CAF50',
              borderRadius: 4,
              barThickness: 14
            },
            {
              data: data.map(d => parseFloat(d.workbook_completion || 0)),
              label: 'Workbook Completion',
              backgroundColor: '#FF9800',
              borderRadius: 4,
              barThickness: 14
            },
            {
              data: data.map(d => parseFloat(d.assessment_card_update || 0)),
              label: 'Assessment Card Update',
              backgroundColor: '#9C27B0',
              borderRadius: 4,
              barThickness: 14
            }
          ]
        };
      }

  // ─── Load User-wise Trend ────────────────────────────────
  private loadUserwiseTrend(): void {
    this.isLoadingUserwise = true;
    this.service.getEcceUserwiseTrend(
      this.selectedYear, this.selectedMonth,
      this.selectedDistrict, this.selectedBlock,
      this.selectedSector, this.selectedUserwiseToggle
    ).subscribe({
      next: (res) => {
        this.buildUserwiseChart(res?.data || []);
        this.isLoadingUserwise = false;
      },
      error: () => { this.isLoadingUserwise = false; }
    });
  }

     private buildUserwiseChart(data: any): void {
          if (!data || !Object.keys(data).length) return;

          // Labels = category keys formatted
          // e.g. "preschool_session" → "PRESCHOOL SESSION"
          this.userwiseTrendLabels = Object.keys(data).map(k =>
            k.replace(/_/g, ' ').toUpperCase()
          );

          this.userwiseTrendChartData = {
            labels: [...this.userwiseTrendLabels],
            datasets: [
              {
                data: Object.values(data).map((d: any) => parseFloat(d.supervisor || 0)),
                label: 'Supervisor',
                backgroundColor: '#5D87FF',
                borderRadius: 4,
                barThickness: 14
              },
              {
                data: Object.values(data).map((d: any) => parseFloat(d.cdpo || 0)),
                label: 'CDPO',
                backgroundColor: '#FF6B6B',
                borderRadius: 4,
                barThickness: 14
              },
              {
                data: Object.values(data).map((d: any) => parseFloat(d.dpo || 0)),
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
    this.service.getEcceDistrictwiseTrend(
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
  this.service.getEcceHierarchicalData(
    this.selectedYear, this.selectedMonth,
    this.selectedDistrict, this.selectedBlock,
    this.selectedSector, this.selectedUser
  ).subscribe({
    next: (res) => {
      const raw = res?.data?.formattedData || [];
      // Remap API fields → table config keys
      this.tableData = raw.map((d: any) => ({
        slNo:                  d.sl_no,
        id:                    d.group_id,
        name:                  d.group_name,
        awcs_available:        d.awcs_available,
        awcs_observed:         d.awcs_observed,
        preschool_sessions_held: d.preschool_sessions_held,
        theme_based_teaching:  d.theme_based_teaching,
        playkit_usage:         d.playkit_usage,
        workbook_completion:   d.workbook_completion,
        assessment_card_update: d.assessment_card_update,
      }));
      this.updateChartConfig(); 
      this.isLoading = false;
    },
    error: () => { this.isLoading = false; }
  });
}
     updateChartConfig(): void {
  const selected = this.metricOptions.find(m => m.value === this.selectedMetric);
  this.chartConfig = {
    enabled: true,
    enableSort: true,
    labelColumnKey: 'name',
    dataColumnKey: this.selectedMetric,       // ← drives the bar chart
    chartLabel: selected?.label || '',
    chartFileName: 'ecce-observation.png',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: '% Compliance' } }
      }
    }
  };
}

   onViewToggle(tabIndex: any): void {
    console.log('tabIndex', tabIndex);
    
  this.isChartView = tabIndex === 1;  // 0 = table, 1 = chart
}

   onMetricChange(value: string): void {
  this.selectedMetric = value;
  this.updateChartConfig();   // just reconfigure — no API call needed
}

  // ─── Prepare Table/Chart JSON Config ─────────────────────
  private prepareJson(): void {
  this.tableData = [];
  

  const commonColumns: TableColumn[] = [
    { key: 'slNo',                    label: 'Sl.No',                   sortable: true, align: 'left' },
    { key: 'awcs_available',          label: 'AWCs Available',           align: 'left', total: true },
    { key: 'awcs_observed',           label: 'AWCs Observed',            align: 'left', total: true },
    { key: 'preschool_sessions_held', label: 'Preschool Sessions Held',  align: 'left', total: true },
    { key: 'theme_based_teaching',    label: 'Theme Based Teaching (%)', suffix: '%' },
    { key: 'playkit_usage',           label: 'Playkit Usage (%)',        suffix: '%' },
    { key: 'workbook_completion',     label: 'Workbook Completion (%)',  suffix: '%' },
    { key: 'assessment_card_update',  label: 'Assessment Card Update (%)', suffix: '%' },
  ];

  if (this.selectedBlock && this.selectedDistrict) {
    this.headerConfig.title = 'Sector wise % of ECCE Observation Compliance';
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
    this.headerConfig.title = 'Block wise % of ECCE Observation Compliance';
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
    this.headerConfig.title = 'District wise % of ECCE Observation Compliance';
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

  // Chart config — use preschool_sessions_held as the bar value
    this.updateChartConfig(); 
}

  // ─── Row Click → Excel Download ──────────────────────────
     onRowClick(row: any): void {
  const year  = this.selectedYear;
  const month = this.selectedMonth;

  if (this.selectedBlock && this.selectedDistrict) {
    // Filter: district + block selected → user clicks sector row
    // Payload: district_id + block_id + sector_id
    this.service.ecceExcelDownload(
      this.selectedDistrict, year, month,
      row?.id,               // sector_id from row
      this.selectedBlock,    // block_id from filter
      this.selectedUser
    ).subscribe({
      next: (res: Blob) => this.triggerDownload(res, `Sector_ECCE_${row.name}_${month}-${year}.xlsx`),
      error: (err) => console.error('Sector Excel error:', err)
    });

  } else if (this.selectedDistrict && !this.selectedBlock) {
    // Filter: district selected → user clicks block row
    // Payload: district_id + block_id
    this.service.ecceExcelDownload(
      this.selectedDistrict, year, month,
      undefined,             // no sector
      row?.id,               // block_id from row
      this.selectedUser
    ).subscribe({
      next: (res: Blob) => this.triggerDownload(res, `Block_ECCE_${row.name}_${month}-${year}.xlsx`),
      error: (err) => console.error('Block Excel error:', err)
    });

  } else {
    // No filter → user clicks district row
    // Payload: district_id only
    this.service.ecceExcelDownload(
      row?.id,               // district_id from row
      year, month,
      undefined, undefined,
      this.selectedUser
    ).subscribe({
      next: (res: Blob) => this.triggerDownload(res, `District_ECCE_${row.name}_${month}-${year}.xlsx`),
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
    if (this.isStateUser) { this.selectedDistrict = ''; this.selectedBlock = ''; }
    if (this.isDistrictUser) { this.selectedBlock = ''; }
    this.updateHeaderTitle();
    this.loadDashboardData();
  }

  private updateHeaderTitle(): void {
    if (this.selectedSector) {
      this.headerTitle = 'ICDS - ECCE Observation (CDPO)';
    } else if (this.selectedBlock || this.selectedDistrict) {
      this.headerTitle = 'ICDS - ECCE Observation (DPO)';
    } else {
      this.headerTitle = 'ICDS - ECCE Observation (State)';
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
        this.blockData = res?.data?.result?.sort((a: any, b: any) => a.block_name.localeCompare(b.block_name));
        if (this.isBlockUser) {
          this.selectedDistrict = this.districtData[0]?.district_id;
          this.selectedBlock = this.blockData[0]?.block_id;
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
        this.isLoading = false;
        this.sectorData = res?.data?.result;
        this.loadDashboardData();
      },
      error: () => { this.isLoading = false; }
    });
  }
}