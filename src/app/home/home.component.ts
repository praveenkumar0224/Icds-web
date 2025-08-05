// home.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit,ViewChildren,QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { switchMap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Chart, ChartConfiguration, ChartType, ChartOptions, registerables, ChartData ,ChartEvent} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';



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

  headerTitile :string =  'ICDS - Observation Overview (State)';
  lineChartLabels: string[] = [];

  lineChart = 'line'
  selectedTabIndex = 0;
    labelChanges = {
        stateObserveBox:"Awc's Observed acrross the State",
        stateProgressBox:"Awc's progress this month",
        stateNotObserveBox:"Awc's not Observed this month",
        stateTotalBox:"Total AWCs",
        stateActiveUserBox:"Active users this month",
        stateObservTrendsChart:"AWC observation trends",
        stateObservNotTrendsChart:"AWCs not visited trends ",
        stateActiveUserChart:"Active User trends" ,
        barchart:"AWCs Observed This Month by District"
}


  barChartLabels: string[] = [];

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Centers Observed',
        backgroundColor: '#5D87FF',
        hoverBackgroundColor: '#4a6cd8',
        borderRadius: 6,
        barThickness: 40
      }
    ]
  }


  // Table data
  displayedColumns: string[] = ['slNo', 'district', 'available', 'observed','centerNotObserved','observePercentage'];
  dataSource = new MatTableDataSource<any>();

  sortDirection: 'asc' | 'desc' = 'asc';



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

  // Filter properties
  selectedYear = '2025';
  selectedMonth = '8';
  selectedDistrict = '';
  selectedBlock = '';
  selectedSector = '';

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



  constructor(
    private service: DashboardServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    const url = 'https://icds.xenovex.com/awcmonitor/home?user_id=OdRwtt9rSR0rMc3aLLgYCMSTN6ksGFVY3x%2B9SluU0NY%3D';
  const params = new URLSearchParams(new URL(url).search);
  const encryptedId = params.get('user_id');

  if (encryptedId) {
    const decrypted = this.service.decryptUserId(encryptedId);
    console.log('Decrypted ID:', decrypted);
  }

  }


  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.service
      .loginWithEmail()
      .pipe(
        switchMap((loginRes) => {
          console.log('Login Success:', loginRes);
          return this.service.fetchUser(); // call fetchUser only after login
        })
      )
      .subscribe({
        next: (userRes) => {
          console.log('User Fetched:', userRes);
          this.loadDashboardData();
         
        },
        error: (err) => {
          console.error('Error:', err);
        },
      });
  }

  // API methods (replace with actual API calls)
  loadDashboardData(): void {
    // Load state Api
    this.isLoading = true;
    this.showChart = true

    console.log(this.selectedYear, this.selectedMonth, this.selectedDistrict, this.selectedBlock, this.selectedSector);
    
    this.service
      .getStatewiseData(this.selectedYear, this.selectedMonth, this.selectedDistrict, this.selectedBlock, this.selectedSector)
      .subscribe({
        next: (res) => {
          // Simulate API call
          setTimeout(() => {
            this.stateLevelData = res.data;
            if (this.stateLevelData?.awc_observed_by_month?.length) {
              this.createDistrictBarChart(this.stateLevelData?.awc_observed_by_month);

              this.setObservationTrendData(this.stateLevelData?.observation_visited_trend);
              this.setNotVisitedTrendData(this.stateLevelData?.observation_not_visited_trend);

              this.loadDistrictData();


             
              this.isLoading = false;

            }

            this.isLoading = false;
          }, 500);



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

  private createDistrictBarChart(awc_observed_by_month: any): void {


    if (awc_observed_by_month) {

      this.barChartLabels = awc_observed_by_month.map(item => item.name.toUpperCase())

      this.barChartData = {
        labels: awc_observed_by_month.map(item => item.name.toUpperCase()),
        datasets: [
          {
            data: awc_observed_by_month.map(item => item.total_observed),
            label: 'Centers Observed',
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

  getTableData(apiData){
    if(apiData){
      const formatted = apiData.map((item, index) => ({
        slNo: index + 1,
        district: item.name,
        available: item.total_observed + item.in_progress + item.not_started,
        observed: item.total_observed,

        centerNotObserved : (item.not_started + item.in_progress)  - item.total_observed,
        observePercentage : Math.round(item.total_observed / (item.not_started + item.in_progress))

      }));
  
      this.dataSource.data = formatted;
    }
  }

  // Event handlers
  toggleView(): void {
    this.showChart = !this.showChart;
  }

  goBack(): void {
    window.history.back();
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

 /*  navigateToDetailPage(districtDetails: any): void {
    console.log('Navigate to detail page:', districtDetails);
    // Implement navigation logic
    // this.router.navigate(['/examples', districtDetails.id]);
  } */

  navigateToDetailPage(event: ChartEvent, activeElements: any[]) { // Temp Not use 
    if (activeElements.length > 0) {
      const index = (activeElements[0] as any).index;
      const label = this.barChartLabels[index];
      const value = this.barChartData.datasets[0].data[index];
      console.log('Clicked Bar:', { label, value });
      // You can now route, filter table, show modal, etc.
    }
  }


  /* downloadBarChart(): void {
    const canvas = this.barChartRef?.nativeElement;
    const chartInstance = Chart.getChart(canvas); // THIS gives exact chart tied to this canvas

    if (!chartInstance) {
      console.warn('Bar chart instance not found.');
      return;
    }

    const image = chartInstance.toBase64Image();
    const link = document.createElement('a');
    link.href = image;
    link.download = 'bar-chart.png';
    link.click();
  } */
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






  // Master Filter 
  loadDistrictData(): void {
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
    if (this.selectedSector || this.selectedSector =="") {
      this.loadDashboardData();
    }
  }

  onDistrictChange(val): void {
    console.log(val);
    
    this.headerTitile = 'ICDS - Observation Overview (DPO)';
 

    if (this.selectedDistrict || this.selectedDistrict=="") {
      this.loadBlockData(this.selectedDistrict);

      const districtName = this.districtData.find(val=> {return val.district_id == this.selectedDistrict} )
      console.log(districtName,'districtName');
      

      if(this.selectedDistrict){
        this.labelChanges = {
         stateObserveBox:`AWC observed in ${districtName.district_name} this month`,
         stateProgressBox:"AWC not observed this month ",
         stateNotObserveBox:"Awc's not Observed this month",
         stateTotalBox:"Total AWCs",
         stateActiveUserBox:"Active users this month",
         stateObservTrendsChart:"AWC observation trends",
         stateObservNotTrendsChart:"AWCs not visited trends ",
         stateActiveUserChart:"Active User trends" ,
         barchart:"AWCs Observed This Month by Block"}
      }
    }
  }

  onBlockChange(): void {
    this.headerTitile = 'ICDS - Observation Overview (DPO)';
    if (this.selectedBlock  || this.selectedBlock=="") {
      this.loadSectorData(this.selectedBlock);

      const blockName = this.blockData.find(val=> {return val.block_id == this.selectedBlock} )
   

    if(this.selectedBlock){
      this.labelChanges = {
       stateObserveBox:`AWC observed in ${blockName.block_name} this month`,
       stateProgressBox:"AWC not observed this month ",
       stateNotObserveBox:"Awc's not Observed this month",
       stateTotalBox:"Total AWCs",
       stateActiveUserBox:"Active users this month",
       stateObservTrendsChart:"Observation completion trends",
       stateObservNotTrendsChart:"AWCs not visited trends ",
       stateActiveUserChart:"Active User trends" ,
       barchart:"AWCs Observed This Month by Sector"}
    }
  }

  }


  sortChartData(order: 'asc' | 'desc',type) {

    let sorted = [];

if (type === 'number') {
  sorted = [...(this.stateLevelData?.awc_observed_by_month || [])].sort((a, b) => {
    return order === 'asc'
      ? a.total_observed - b.total_observed
      : b.total_observed - a.total_observed;
  });
} else {
  sorted = [...(this.stateLevelData?.awc_observed_by_month || [])].sort((a, b) => {
    return order === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });
}

console.log(sorted, 'sorted');
  
    this.barChartLabels = sorted.map(item => item.name);
  
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: sorted.map(item => item.total_observed),
          label: 'Centers Observed',
          backgroundColor: '#5D87FF',
          hoverBackgroundColor: '#4a6cd8',
          borderRadius: 6,
          barThickness: 30
        }
      ]
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
    this.isLoading = true;
    this.service.postSectorData(blockId).subscribe({
      next: (res) => {
        
        this.isLoading = false;
        console.log(res, 'Sector Data ');
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

}