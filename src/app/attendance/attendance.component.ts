import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Chart, ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit, AfterViewInit {
   @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
     @ViewChild('lineChartChart1') lineChartChart1Ref!: ElementRef<HTMLCanvasElement>;
     @ViewChild('lineChartChart2') lineChartChart2Ref!: ElementRef<HTMLCanvasElement>;
     @ViewChild('lineChartChart3') lineChartChart3Ref!: ElementRef<HTMLCanvasElement>;

   headerTitile: string = 'ICDS - Attendance Overview (State)';
   lineChartLabels: string[] = [];

   lineChart = 'line'
  selectedTabIndex = 0;
  labelChanges = {
    stateObserveBox: "Average Attendance in state this month",
    stateProgressBox: "Male children",
    stateNotObserveBox: "Female children",
    stateTotalBox: "2-4 years children",
    stateActiveUserBox: "4-6 years children",
    stateObservTrendsChart: "Attendance trends",
    stateObservNotTrendsChart: "Child Age Category-wise Attendance trends",
    stateActiveUserChart: "Gender-wise Attendance trends",
    barchart: "AWCs Attendance This Month by District",
    sectionType:"District"
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
    displayedColumns: string[] = ['slNo', 'district', 'available', 'observed', 'centerNotObserved', 'observePercentage'];
      dataSource = new MatTableDataSource<any>([]);
  
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
          // selectedYear = '2025';
          // selectedMonth = '8';
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
          private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
   
  }


 

  ngAfterViewInit(): void {
      this.loadDashboardData()
  }

    loadDashboardData(): void {
    // Load state Api
    this.isLoading = true;
    this.showChart = true
    this.service
      .getStatewiseDataForAttandance(this.selectedYear, this.selectedMonth, this.selectedDistrict, this.selectedBlock, this.selectedSector)
      .subscribe({
        next: (res) => {
        
          this.stateLevelData = res.data;
          if (this.stateLevelData?.attendence_by_month?.length) {

            this.createDistrictBarChart(this.stateLevelData?.attendence_by_month);

            this.setAttandanceData(this.stateLevelData?.attendece_trend);
            this.setCategoryWiseAttendanceTrend(this.stateLevelData?.category_wise_attendece_trend);
            this.setGenderWiseAttendanceTrend(this.stateLevelData?.gender_wise_attendece_trend);




             this.isLoading = false;

          }
          console.log("lavuduuu");
          

          this.loadDistrictData();

          this.isLoading = false;
  



        },
        error: (err) => {
          this.isLoading = false;
          console.error('Statewise API Error:', err);
        },
      });
  }


    setAttandanceData(lineChatdata: any): void {

    const labels = lineChatdata.map(item => item.month.toUpperCase());
    const data = lineChatdata.map(item => item.attendance_percentage.replace('%', ''));

    this.lineChartLabels = labels
    this.lineChartDataVisited[0].data = data

  }


  setGenderWiseAttendanceTrend(lineChatdata: any): void {

    const labels = lineChatdata.map(item => item.month.toUpperCase());
        const twoToFourData = lineChatdata.map((item: any) =>
        parseFloat(item.twoTofour)
      );
      const fourToSixData = lineChatdata.map((item: any) =>
        parseFloat(item.fourToSiz)
      );
  
    this.lineChartLabels = labels
    
     this.lineChartDataNotVisited = [
    {
      data: twoToFourData,
      label: '2–4 Years',
      borderColor: '#5D87FF',
      backgroundColor: 'rgba(93, 135, 255, 0.2)',
      fill: false,
      tension: 0.3
    },
    {
      data: fourToSixData,
      label: '4–6 Years',
      borderColor: '#FF6B6B',
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      fill: false,
      tension: 0.3
    }
  ];

  }

  setCategoryWiseAttendanceTrend(lineChatdata: any): void {
console.log(lineChatdata,'lineChatdata');


    const labels = lineChatdata.map(item => item.month.toUpperCase());
    const maleAttendanceData = lineChatdata?.map((item: any)=>parseFloat(item.male_attendece_percentage));
        const femaleAttendanceData = lineChatdata?.map((item: any)=>parseFloat(item.female_attendece_percentage));

        console.log(maleAttendanceData);
        console.log(femaleAttendanceData);
        
        

    
    this.lineChartLabels = labels
    this.lineChartUserVisited = [
       {
      data: maleAttendanceData,
      label: "male",
       borderColor: '#5D87FF',
      backgroundColor: 'rgba(93, 135, 255, 0.2)',
      fill: false,
      tension: 0.3
       },
       {
      data: femaleAttendanceData,
      label:"female",
        borderColor: '#FF6B6B',
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      fill: false,
      tension: 0.3
       }
    ]
    

  }
  

     private createDistrictBarChart(attendence_by_month: any): void {
      console.log(attendence_by_month);
      


    if (attendence_by_month) {

      this.barChartLabels = attendence_by_month.map(item => item.name.toUpperCase())

      this.barChartData = {
        labels: attendence_by_month.map(item => item.name.toUpperCase()),
        datasets: [
          {
            data: attendence_by_month.map(item => item.attendance_percentage.toString().replace('%', '')),
            label: 'AWC\'s Attendance',
            backgroundColor: '#5D87FF',
            hoverBackgroundColor: '#4a6cd8',
            borderRadius: 6,
            barThickness: 30,
        
          }
        ]
      }

      this.getTableData(attendence_by_month)

    }


  }

   private setupTableSorting(): void {
  if (this.sort && this.dataSource) {
    this.dataSource.sort = this.sort;
    
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'district':
          return data.district.toLowerCase();
        case 'absent':
          return Number(data.absent);
        case 'attendancePercentage':
          return Number(data.attendancePercentage);
        case 'present':
          return Number(data.present);
        case 'available':
          return Number(data.available);
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
      present: item?.total_children_present,
      available: item?.total_children_available,
      absent: item?.total_children_absent,
      attendancePercentage: item?.attendance_percentage,
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


      // Master Filter 
  loadDistrictData(): void {
    console.log('Test1',);
    // this.districtData = []
    
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



   clearFilters(): void {
  // Check if any filter is currently selected
  const filtersApplied = this.selectedDistrict || this.selectedBlock || this.selectedSector;
  
  // Reset filter variables
  this.selectedDistrict = '';
  this.selectedBlock = '';
  this.selectedSector = '';

  // Reset labelChanges to default state-level labels
  this.labelChanges = {
    stateObserveBox: "Average Attendance in state this month",
    stateProgressBox: "Male children",
    stateNotObserveBox: "Female children",
    stateTotalBox: "2-4 years children",
    stateActiveUserBox: "4-6 years children",
    stateObservTrendsChart: "Attendance trends",
    stateObservNotTrendsChart: "Child Age Category-wise Attendance trends",
    stateActiveUserChart: "Gender-wise Attendance trends",
    barchart: "AWCs Observed This Month by District",
    sectionType: "District"
  };

  // Reset header title to state level
  this.headerTitile = 'ICDS - Observation Overview (State)';

  // If filters were applied, clear the data and reload the state-level data.
  // This will also trigger the fetch for district data again.
  if (filtersApplied) {
    this.districtData = [];
    this.blockData = [];
    this.sectorData = [];
    this.loadDashboardData();
  }
}


  onDistrictChange(val): void {
    console.log(val);

    this.headerTitile = 'ICDS - Attendance Overview (DPO)';


    if (this.selectedDistrict || this.selectedDistrict == "") {
      this.loadBlockData(this.selectedDistrict);

      const districtName = this.districtData.find(val => { return val.district_id == this.selectedDistrict })
      console.log(districtName, 'districtName');


      if (this.selectedDistrict) {
        this.labelChanges = {
          stateObserveBox: `Average Attendance in ${districtName && districtName.district_name} this month`,
          stateProgressBox: "Male children",
          stateNotObserveBox: "Female children",
          stateTotalBox: "2-4 years children",
          stateActiveUserBox: "4-6 years children",
          stateObservTrendsChart: "Attendance trends",
          stateObservNotTrendsChart: "Child Age Category-wise Attendance trends",
          stateActiveUserChart: "Gender-wise Attendance trends",
          barchart: "AWCs Observed This Month by Block",
          sectionType:"Block"
        }
      }
    }
  }

    onBlockChange(): void {
    this.headerTitile = 'ICDS - Observation Overview (DPO)';
    if (this.selectedBlock ) {
      this.loadSectorData(this.selectedBlock);

      const blockName = this.blockData.find(val => { return val.block_id == this.selectedBlock })


      if (this.selectedBlock) {
        this.labelChanges = {
          stateObserveBox: `Average Attendance ${blockName && blockName.block_name} this month`,
          stateProgressBox: "Awc's progress this month ",
          stateNotObserveBox: "Female children",
          stateTotalBox: "2-4 years children",
          stateActiveUserBox: "4-6 years children",
          stateObservTrendsChart: "Attendance trends",
          stateObservNotTrendsChart: "Child Age Category-wise Attendance trends",
          stateActiveUserChart: "Gender-wise Attendance trends",
          barchart: "AWCs Observed This Month by Sector",
          sectionType:"Sector"
        }
      }
      // this.loadDashboardData();
    }

  }



   sortChartData(order: 'asc' | 'desc', type) {

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
