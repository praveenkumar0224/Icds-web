// home.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { switchMap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Chart, ChartConfiguration, ChartType, ChartOptions, registerables, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatSnackBar } from '@angular/material/snack-bar';

// Register Chart.js components
Chart.register(...registerables);

interface DashboardData {
  awcsObserved: number;
  awcsNotObserved: number;
  observationTrends: Array<{ month: string; value: number }>;
  notVisitedTrends: Array<{ month: string; value: number }>;
  observationsByBlock: Array<{ block: string; count: number }>;
  observationsByCadre: Array<{ cadre: string; count: number }>;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart1') lineChartChart1Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart2') lineChartChart2Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart3') lineChartChart3Ref!: ElementRef<HTMLCanvasElement>;

  headerTitile: string = 'ICDS - Observation Overview (State)';
  lineChartLabels: string[] = [];

  lineChart = 'line'
  selectedTabIndex = 0;
  labelChanges = {
    stateObserveBox: "Awc's Observed across the State",
    stateProgressBox: "Awc's progress this month",
    stateNotObserveBox: "Awc's not Observed this month",
    stateTotalBox: "Total AWCs",
    stateActiveUserBox: "Active users this month",
    stateObservTrendsChart: "AWC observation trends",
    stateObservNotTrendsChart: "AWCs not visited trends ",
    stateActiveUserChart: "Active User trends",
    barchart: "AWCs Observed This Month by District",
    sectionType: "District"
  }

  barChartLabels: string[] = [];

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Centers Observed Percentage',
        backgroundColor: '#5D87FF',
        hoverBackgroundColor: '#4a6cd8',
        borderRadius: 6,
        barThickness: 40
      }
    ]
  }

  // Table data
  displayedColumns: string[] = ['slNo', 'district', 'available', 'observed', 'centerNotObserved', 'observePercentage'];
  dataSource = new MatTableDataSource<any>([]);

  sortDirection: 'asc' | 'desc' = 'asc';
  deCryptedId: any

  // Chart ViewChild references
  @ViewChild('observationTrendChart', { static: false })
  observationTrendCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('notVisitedTrendChart') notVisitedTrendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('districtBarChart') districtBarCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild(MatSort) sort!: MatSort;

  showChart = true;
  isLoading = false;

  // Data properties
  stateLevelData: any;
  districtData: any[] = [];
  blockData: any[] = [];
  sectorData: any[] = [];

  icdsRoleId: any;

  // 🔹 Added missing properties for user district info
  userDistrictId: string = '';
  userDistrictName: string = '';

  // Filter properties
  selectedYear: string = new Date().getFullYear().toString();
  selectedMonth: string = (new Date().getMonth() + 1).toString();
  currentYear: string = new Date().getFullYear().toString();
  currentMonth: number = new Date().getMonth() + 1;

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  selectedDistrict = '';
  selectedBlock = '';
  selectedSector = '';


           chartSortOrder: 'asc' | 'desc' = 'asc';
  alphaSortOrder: 'asc' | 'desc' = 'asc';


  // Chart instances
  observationTrendChart?: Chart;
  notVisitedTrendChart?: Chart;
  districtBarChart?: Chart;

  // Line chart
  public observationTrendData: ChartData<'line'>;
  public notVisitedTrendData: ChartData<'line'>;

  lineChartDataVisited = [
    {
      data: [],
      label: 'AWC center ',
      legend: 'AWC center',
      borderColor: '#0097F9',
      backgroundColor: 'rgba(0, 151, 249, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ];

  lineChartDataNotVisited = [
    {
      data: [],
      label: 'AWC center',
      legend: 'AWC center',
      borderColor: '#0097F9',
      backgroundColor: 'rgba(0, 151, 249, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ];

  lineChartUserVisited = [
    {
      data: [],
      label: 'Active User',
      legend: 'Active User',
      borderColor: '#0097F9',
      backgroundColor: 'rgba(0, 151, 249, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ];

  barChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          let value = context.raw;
          return `${context.dataset.label}: ${Math.round(Number(value))}%`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: function(value) {
          return value + '%';
        }
      }
    }
  }
};

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  lineChartOptionsDistricts: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    }
  };

  constructor(
    private service: DashboardServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      
      const encryptedId = params['user_id']; // fetch dynamically
      if (encryptedId) {
        this.deCryptedId = this.service.decryptUserId(encryptedId);
        console.log(this.deCryptedId, 'decrypted user_id');
      }
    });
  }

  geIdFromUrl() {

  }

  ngAfterViewInit(): void {
    this.isLoading = true;
    this.service
      .loginWithEmail(this.deCryptedId)
      // .pipe(
      //   switchMap((loginRes) => {
      //     this.isLoading = false;
      //     this.openToast('success')
      //     console.log('Login Success:', loginRes);
      //     return this.service.fetchUser(this.deCryptedId); // call fetchUser only after login
      //   })
      // )
      .subscribe({
        next: (userRes) => {
          this.isLoading = false;
          this.openToast('success');
          console.log('User Fetched:', userRes);

          if (userRes?.data?.[0]?.icds_role_id == 4 && userRes?.data?.[0]?.district_id) {
            this.selectedDistrict = userRes.data[0].district_id.toString();
            this.icdsRoleId = userRes.data[0].icds_role_id;

            // 🔹 Store user's district info for later use
            this.userDistrictId = userRes.data[0].district_id.toString();

            this.service.postDistrictData().subscribe({
              next: (res) => {
                this.isLoading = false;
                console.log(res, 'district Data ');
                this.districtData = res?.data?.result?.sort((a: any, b: any) =>
                  a.district_name.localeCompare(b.district_name)
                );

                const districtName = this.districtData.find(
                  (val: any) => val.district_id == this.selectedDistrict
                );

                // 🔹 Store district name for later use
                this.userDistrictName = districtName?.district_name || '';

                this.labelChanges = {
                  stateObserveBox: `AWC observed in ${districtName?.district_name || ''} this month`,
                  stateProgressBox: "Awc's progress this month",
                  stateNotObserveBox: "Awc's not Observed this month",
                  stateTotalBox: "Total AWCs",
                  stateActiveUserBox: "Active users this month",
                  stateObservTrendsChart: "AWC observation trends",
                  stateObservNotTrendsChart: "AWCs not visited trends ",
                  stateActiveUserChart: "Active User trends",
                  barchart: "AWCs Observed This Month by Block",
                  sectionType: "Block"
                };

                // load block data AFTER district is set
                this.loadBlockData(this.selectedDistrict);
              },
              error: (err) => {
                this.isLoading = false;
                console.error('Statewise API Error:', err);
              },
            });

            this.headerTitile = `ICDS - Observation Overview (DPO)`;
          }

          this.loadDashboardData();
        },
        error: (err) => {
          this.isLoading = false;
          this.openToast('error')
          console.error('Error:', err);
        },
      });
  }

  // API methods (replace with actual API calls)
  loadDashboardData(): void {
    // Load state Api
    this.isLoading = true;
    this.showChart = true

    console.log(this.selectedYear, this.selectedMonth, this.selectedDistrict, this.selectedBlock, this.selectedSector,"dashboard data");

    this.service
      .getStatewiseData(this.selectedYear, this.selectedMonth, this.selectedDistrict, this.selectedBlock, this.selectedSector)
      .subscribe({
        next: (res) => {
          this.stateLevelData = res.data;
          if (this.stateLevelData?.awc_observed_by_month?.length) {
            
            this.createDistrictBarChart(this.stateLevelData?.awc_observed_by_month);

            this.setObservationTrendData(this.stateLevelData?.observation_visited_trend);
            this.setNotVisitedTrendData(this.stateLevelData?.observation_not_visited_trend);
            this.setActiveUsertrendsdTrendData(this.stateLevelData?.active_users_trend);

            this.loadDistrictData();

            this.isLoading = false;
          }

          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Statewise API Error:', err);
        },
      });
  }

  setObservationTrendData(lineChatdata: any): void {
    const labels = lineChatdata.map(item => item.month.toUpperCase());
    const data = lineChatdata.map(item => item.total_observed);

    this.lineChartLabels = labels
    this.lineChartDataVisited[0].data = data
  }

  setNotVisitedTrendData(lineChatdata: any): void {
    const labels = lineChatdata.map(item => item.month.toUpperCase());
    const data = lineChatdata.map(item => item.not_started);

    this.lineChartLabels = labels
    this.lineChartDataNotVisited[0].data = data
  }

  setActiveUsertrendsdTrendData(lineChatdata: any): void {
    console.log(lineChatdata, 'lineChatdata');

    const labels = lineChatdata.map(item => item.month.toUpperCase());
    const data = lineChatdata.map(item => item.active_users);

    this.lineChartLabels = labels
    this.lineChartUserVisited[0].data = data
    console.log();
  }

  private createDistrictBarChart(awc_observed_by_month: any): void {
    if (awc_observed_by_month) {
      this.barChartLabels = awc_observed_by_month.map(item => item.name.toUpperCase())

      this.barChartData = {
        labels: awc_observed_by_month.map(item => item.name.toUpperCase()),
        datasets: [
          {
            data: awc_observed_by_month.map(item => {
              const total = item.total_observed + item.in_progress + item.not_started;
              return total > 0 ? (item.total_observed / total) * 100 : 0;
            }),
            label: 'Centers Observed Percentage',
            backgroundColor: '#5D87FF',
            hoverBackgroundColor: '#4a6cd8',
            borderRadius: 6,
            barThickness: 30
          }
        ]
      }

      this.getTableData(awc_observed_by_month)
    }
  }

  private setupTableSorting(): void {
    if (this.sort && this.dataSource) {
      this.dataSource.sort = this.sort;
      
      this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
        switch (sortHeaderId) {
          case 'district':
            return data.district.toLowerCase();
          case 'centerNotObserved':
            return Number(data.centerNotObserved);
          case 'observePercentage':
            return Number(data.observePercentage);
          case 'available':
            return Number(data.available);
          case 'observed':
            return Number(data.observed);
          case 'slNo':
            return Number(data.slNo);
          default:
            return data[sortHeaderId];
        }
      };
    }
  }
  
  getTableData(apiData: any) {
    if (apiData) {
      const formatted = apiData.map((item, index) => ({
        slNo: index + 1,
        district: item.name,
        id: item.id,
        available: item.total_observed + item.in_progress + item.not_started,
        observed: item.total_observed,
        centerNotObserved: (item.total_observed + item.in_progress + item.not_started) - item.total_observed,
        observePercentage: Math.round(
          (item.total_observed / (item.total_observed + item.in_progress + item.not_started)) * 100
        )
      }));

      this.dataSource.data = formatted;
      
      // Set up sorting after data is loaded
      setTimeout(() => {
        this.setupTableSorting();
      }, 0);
    }
  }

  // Event handlers
  toggleView(): void {
    this.showChart = !this.showChart;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  toggleSort(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sort.active = 'available';
    this.sort.direction = this.sortDirection;
    this.sort.sortChange.emit({
      active: 'available',
      direction: this.sortDirection,
    });
  }

  navigateToDetailPage(event: ChartEvent, activeElements: any[]) { // Temp Not use 
    if (activeElements.length > 0) {
      const index = (activeElements[0] as any).index;
      const label = this.barChartLabels[index];
      const value = this.barChartData.datasets[0].data[index];
      console.log('Clicked Bar:', { label, value });
      // You can now route, filter table, show modal, etc.
    }
  }

  downloadLineChart(): void {
    const canvas = this.lineChartChart1Ref?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn('Bar chart instance not found.');
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL('image/png');

    // 5. Trigger download
    const link = document.createElement('a');
    link.href = image;
    link.download = 'AWC observation trends.png';
    link.click();
  }

  downloadline2Chart(): void {
    const canvas = this.lineChartChart2Ref?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn('Bar chart instance not found.');
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL('image/png');

    // 5. Trigger download
    const link = document.createElement('a');
    link.href = image;
    link.download = 'AWCs not visited trends.png';
    link.click();
  }

  downloadline3Chart(): void {
    const canvas = this.lineChartChart3Ref?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn('Bar chart instance not found.');
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL('image/png');

    // 5. Trigger download
    const link = document.createElement('a');
    link.href = image;
    link.download = 'Active user trends.png';
    link.click();
  }

  downloadBarChart(): void {
    const canvas = this.barChartRef?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn('Bar chart instance not found.');
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL('image/png');

    // 5. Trigger download
    const link = document.createElement('a');
    link.href = image;
    link.download = 'bar-chart.png';
    link.click();
  }

  downloadExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook = {
      Sheets: { 'AWC Data': worksheet },
      SheetNames: ['AWC Data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    FileSaver.saveAs(new Blob([excelBuffer]), 'awc-observation.xlsx');
  }

     onDistrictOrBlockClick(row: any): void {
  console.log(row, 'row data');

  const year = this.selectedYear;
  const month = this.selectedMonth;

  console.log(this.sectorData);
  
  if (this.sectorData.length >= 1) {
    console.log("sector is working iiii");
    
    this.service.lineTableExcelDownload(undefined, year, month, row)
      .subscribe({
        next: (res: Blob) => {
          const url = window.URL.createObjectURL(res);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Sector_Report_${row}_${month}-${year}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Sector API error:', err)
      });
  } else if (this.blockData.length >= 1) {
    this.service.lineTableExcelDownload(undefined, year, month, undefined, row)
      .subscribe({
        next: (res: Blob) => {
          const url = window.URL.createObjectURL(res);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Block_Report_${row}_${month}-${year}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Block API error:', err)
      });
  } else if (this.districtData.length >= 1) {
    this.service.lineTableExcelDownload(row, year, month)
      .subscribe({
        next: (res: Blob) => {
          const url = window.URL.createObjectURL(res);
          const a = document.createElement('a');
          a.href = url;
          a.download = `District_Report_${row}_${month}-${year}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('District API error:', err)
      });
  } 
}




  // Master Filter 
  loadDistrictData(): void {
    console.log('Test1',);
    
    // Load state Api
    this.isLoading = true;
    this.service.postDistrictData().subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res, 'district Data ');
        this.districtData = res?.data?.result;

        this.districtData = res?.data?.result?.sort((a: any, b: any) =>
          a.district_name.localeCompare(b.district_name)
        );
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Statewise API Error:', err);
      },
    });
  }

  onFilterChange(): void {
    // Implement filter logic here
    this.headerTitile = 'ICDS - Observation Overview (CDPO)'
    if (this.selectedSector || this.selectedSector == "") {
      this.loadDashboardData();
    }
  }

  // 🔹 Fixed clearFilters method
  clearFilters(): void {
    // Check if any filter is currently selected
    const filtersApplied = this.selectedDistrict || this.selectedBlock || this.selectedSector;

    // Reset filter variables
    this.selectedDistrict = '';
    this.selectedBlock = '';
    this.selectedSector = '';

    // Clear dependent data arrays
    this.blockData = [];
    this.sectorData = [];

    if (this.icdsRoleId === 4) {
      // 🔹 For role 4 users, reset to their district-level defaults
      
      // Find user's district info from the fetched district data
      const userDistrict = this.districtData.find(
        (district: any) => district.district_id.toString() === this.userDistrictId
      );

      if (userDistrict) {
        this.selectedDistrict = userDistrict.district_id.toString();
        
        this.labelChanges = {
          stateObserveBox: `AWC observed in ${userDistrict.district_name || ''} this month`,
          stateProgressBox: "Awc's progress this month",
          stateNotObserveBox: "Awc's not Observed this month",
          stateTotalBox: "Total AWCs",
          stateActiveUserBox: "Active users this month",
          stateObservTrendsChart: "AWC observation trends",
          stateObservNotTrendsChart: "AWCs not visited trends ",
          stateActiveUserChart: "Active User trends",
          barchart: "AWCs Observed This Month by Block",
          sectionType: "Block"
        };

        this.headerTitile = `ICDS - Observation Overview (DPO)`;
        
        // Always reload block data for role 4 users
        this.loadBlockData(this.selectedDistrict);
      } else {
        // Fallback if user district not found
        this.loadDashboardData();
      }
    } else {
      // 🔹 Reset to state-level defaults for other roles
      this.labelChanges = {
        stateObserveBox: "Awc's Observed across the State",
        stateProgressBox: "Awc's progress this month",
        stateNotObserveBox: "Awc's not Observed this month",
        stateTotalBox: "Total AWCs",
        stateActiveUserBox: "Active users this month",
        stateObservTrendsChart: "AWC observation trends",
        stateObservNotTrendsChart: "AWCs not visited trends ",
        stateActiveUserChart: "Active User trends",
        barchart: "AWCs Observed This Month by District",
        sectionType: "District"
      };

      this.headerTitile = 'ICDS - Observation Overview (State)';
      
      // Always reload dashboard data for state-level view
      this.loadDashboardData();
    }
  }

  onDistrictChange(val): void {
    console.log(val);
    this.blockData = [];
    this.sectorData = [];
    this.selectedBlock = '';
    this.selectedSector = '';

    if(!this.selectedDistrict){
            this.headerTitile = 'ICDS - Observation Overview (State)';
        this.labelChanges = {
        stateObserveBox: "Awc's Observed across the State",
        stateProgressBox: "Awc's progress this month",
        stateNotObserveBox: "Awc's not Observed this month",
        stateTotalBox: "Total AWCs",
        stateActiveUserBox: "Active users this month",
        stateObservTrendsChart: "AWC observation trends",
        stateObservNotTrendsChart: "AWCs not visited trends ",
        stateActiveUserChart: "Active User trends",
        barchart: "AWCs Observed This Month by District",
        sectionType: "District"
      };

       this.loadDashboardData();
    return;
    }

    this.headerTitile = 'ICDS - Observation Overview (DPO)';

    if (this.selectedDistrict) {
      this.loadBlockData(this.selectedDistrict);

      const districtName = this.districtData.find(val => { return val.district_id == this.selectedDistrict })
      console.log(districtName, 'districtName');

      if (this.selectedDistrict) {
        this.labelChanges = {
          stateObserveBox: `AWC observed in ${districtName && districtName.district_name} this month`,
          stateProgressBox: "Awc's progress this month",
          stateNotObserveBox: "Awc's not Observed this month",
          stateTotalBox: "Total AWCs",
          stateActiveUserBox: "Active users this month",
          stateObservTrendsChart: "AWC observation trends",
          stateObservNotTrendsChart: "AWCs not visited trends ",
          stateActiveUserChart: "Active User trends",
          barchart: "AWCs Observed This Month by Block",
          sectionType: "Block"
        }
      }
    }
  }

  onBlockChange(): void {
     this.sectorData = [];
  this.selectedSector = '';

     if(!this.selectedBlock){
            this.headerTitile = 'ICDS - Observation Overview (State)';
        this.labelChanges = {
        stateObserveBox: "Awc's Observed across the State",
        stateProgressBox: "Awc's progress this month",
        stateNotObserveBox: "Awc's not Observed this month",
        stateTotalBox: "Total AWCs",
        stateActiveUserBox: "Active users this month",
        stateObservTrendsChart: "AWC observation trends",
        stateObservNotTrendsChart: "AWCs not visited trends ",
        stateActiveUserChart: "Active User trends",
        barchart: "AWCs Observed This Month by District",
        sectionType: "District"
      };

       this.loadDashboardData();
    return;
    }


    this.headerTitile = 'ICDS - Observation Overview (DPO)';
    if (this.selectedBlock ) {
      this.loadSectorData(this.selectedBlock);

      const blockName = this.blockData.find(val => { return val.block_id == this.selectedBlock })

      if (this.selectedBlock) {
        this.labelChanges = {
          stateObserveBox: `AWC observed in ${blockName && blockName.block_name} this month`,
          stateProgressBox: "Awc's progress this month ",
          stateNotObserveBox: "Awc's not Observed this month",
          stateTotalBox: "Total AWCs",
          stateActiveUserBox: "Active users this month",
          stateObservTrendsChart: "Observation completion trends",
          stateObservNotTrendsChart: "AWCs not visited trends ",
          stateActiveUserChart: "Active User trends",
          barchart: "AWCs Observed This Month by Sector",
          sectionType: "Sector"
        }
      }
    }
  }

  toggleChartSort(type: 'number' | 'alpha'): void {
    if (type === 'number') {
      // Toggle between asc and desc for numerical sorting
      this.chartSortOrder = this.chartSortOrder === 'asc' ? 'desc' : 'asc';
      this.sortChartData(this.chartSortOrder, 'number');
    } else {
      // Toggle between asc and desc for alphabetical sorting
      this.alphaSortOrder = this.alphaSortOrder === 'asc' ? 'desc' : 'asc';
      this.sortChartData(this.alphaSortOrder, 'alpha');
    }
  }


  sortChartData(order: 'asc' | 'desc', type) {
    let sorted = [];

    // calculate % observed for each item before sorting
    const dataWithPercent = (this.stateLevelData?.awc_observed_by_month || []).map(item => {
      const total = item.total_observed + item.in_progress + item.not_started;
      const observedPercent = total > 0 ? (item.total_observed / total) * 100 : 0;
      return { ...item, observedPercent };
    });

    if (type === 'number') {
      // sort by observed %
      sorted = [...dataWithPercent].sort((a, b) => {
        return order === 'asc'
          ? a.observedPercent - b.observedPercent
          : b.observedPercent - a.observedPercent;
      });
    } else {
      // sort by district name
      sorted = [...dataWithPercent].sort((a, b) => {
        return order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    }

    console.log(sorted, 'sorted');

    this.barChartLabels = sorted.map(item => item.name.toUpperCase());

    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: sorted.map(item => parseInt(item.observedPercent)), // ✅ use % data
          label: 'Centers Observed Percentage',
          backgroundColor: '#5D87FF',
          hoverBackgroundColor: '#4a6cd8',
          borderRadius: 6,
          barThickness: 30
        }
      ]
    };

     this.barChartOptions = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          console.log(context, 'context');
          
          let value = context.raw; // dataset value
          return `${context.dataset.label}: ${value}%`; 
          // Example: "Centers Observed: 92%"
        }
      }
    }
  }
};
  }

  loadBlockData(districtId): void {
    // Load state Api
    this.isLoading = true;
    this.service.postBlockData(districtId).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res, 'Block Data ');
        this.blockData = res?.data?.result;

        this.blockData = res?.data?.result?.sort((a:any,b:any)=>(
          a.block_name.localeCompare(b.block_name)
        ))
        this.loadDashboardData();

      },
      error: (err) => {
        this.isLoading = false;
        console.error('Statewise API Error:', err);
      },
    });
  }

  loadSectorData(blockId): void {
    // Load state Api
    console.log(blockId,"black Id checking");
    
    this.isLoading = true;
    this.service.postSectorData(blockId).subscribe({
      next: (res) => {

        this.isLoading = false;
        console.log(res?.data?.result, 'Sector Data ');
        this.sectorData = res?.data?.result;
        this.loadDashboardData();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Statewise API Error:', err);
      },
    });
  }

  ngOnDestroy(): void {
    // Clean up chart instances
    if (this.observationTrendChart) {
      this.observationTrendChart.destroy();
    }
    if (this.notVisitedTrendChart) {
      this.notVisitedTrendChart.destroy();
    }
    if (this.districtBarChart) {
      this.districtBarChart.destroy();
    }
  }

  goFor() {
    this.router.navigate(['/courses', 123456]);
  }
  
  openToast(type: 'success' | 'error') {
    this.snackBar.open(
      type === 'success' ? 'Login Successful ✅' : 'Something went wrong ❌',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: type === 'success' ? ['toast-success'] : ['toast-error'],
      }
    );
  }
}