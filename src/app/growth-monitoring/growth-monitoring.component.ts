import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Chart, ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-growth-monitoring',
  templateUrl: './growth-monitoring.component.html',
  styleUrls: ['./growth-monitoring.component.scss']
})
export class GrowthMonitoringComponent implements OnInit, AfterViewInit {
      @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
         @ViewChild('lineChartChart1') lineChartChart1Ref!: ElementRef<HTMLCanvasElement>;
         @ViewChild('lineChartChart2') lineChartChart2Ref!: ElementRef<HTMLCanvasElement>;
         @ViewChild('lineChartChart3') lineChartChart3Ref!: ElementRef<HTMLCanvasElement>;
    
       headerTitile: string = 'ICDS - Growth Monitoring (State)';
       lineChartLabels: string[] = [];
    
       lineChart = 'line'
      selectedTabIndex = 0;
      labelChanges = {
        stateChildDeviation: "No.of children with deviation",
        statePercentageChildDeviation: "% of children with deviation",
        stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
        stateBySupervisorNoDeviationThisMonth: "% reporting no deviations this month",
        stateBySupervisor100DeviationThisMonth: "% reporting 100% deviations this month",
        stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
        stateSupervisorDeviationTrendsChart: "% of supervisors reporting 100% deviation",
        stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
        barchart: "District wise % of AWC's with deviation",
        sectionType:"District"
      }

       barChartAWCDeviationLabels: string[] = [];
      
        barChartAWCDeviation: ChartData<'bar'> = {
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

         barChartSupervisorDeviationLabels: string[] = [];
      
        barChartSupervisorDeviation: ChartData<'bar'> = {
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

            barChartAgegroupDeviationLabels: string[] = [];
      
        barChartAgegroupDeviation: ChartData<'bar'> = {
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
        displayedColumns: string[] = ['slNo', 'district', 'totalChildrenPresent', 'childrenNoDeviation', 'childrenDeviationCount', 'deviationPercentage'];
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
              selectedDeviationCategory = "both"
              orderBy = 'awc'
              isToggleOn = false;
              isToggleOnForSupervisor = false;
              isToggleOnForHierarchical = false;
    
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
    
      private clearAllData(): void {
      // Clear state level data
      this.stateLevelData = null;
      
      // Clear chart data
      this.lineChartLabels = [];
      this.lineChartDataVisited[0].data = [];
      this.lineChartDataNotVisited = [
        {
          data: [],
          label: '2–4 Years',
          borderColor: '#5D87FF',
          backgroundColor: 'rgba(93, 135, 255, 0.2)',
          fill: false,
          tension: 0.3
        },
        {
          data: [],
          label: '4–6 Years',
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          fill: false,
          tension: 0.3
        }
      ];
      this.lineChartUserVisited = [
        {
          data: [],
          label: "male",
          borderColor: '#5D87FF',
          backgroundColor: 'rgba(93, 135, 255, 0.2)',
          fill: false,
          tension: 0.3
        },
        {
          data: [],
          label: "female",
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          fill: false,
          tension: 0.3
        }
      ];
      
      // Clear bar chart data
      this.barChartLabels = [];
      this.barChartData = {
        labels: [],
        datasets: [
          {
            data: [],
            label: 'AWC\'s Attendance',
            backgroundColor: '#5D87FF',
            hoverBackgroundColor: '#4a6cd8',
            borderRadius: 6,
            barThickness: 30
          }
        ]
      };
      
      // Clear table data
      this.dataSource.data = [];
    }
    
    
     
    
      ngAfterViewInit(): void {
          this.loadDashboardData()
      }
    
        loadDashboardData(): void {
  // Clear previous data immediately
  this.clearAllData();

  // Loading indicators
  this.isLoading = true;
  this.showChart = true;

  // Run both API calls in parallel
  forkJoin({
    observation: this.service.getgmDashboardByobservation(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory
    ),
    awc: this.service.getgmDashboardByawc(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory
    ),
    supervisor: this.service.getgmBySupervisor(
       this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory
    ),
    trendsbysupervisor: this.service.getgmTrendsBySupervisor(
         this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory
    ),
    ageGroup: this.service.getgmAgegroupDeviation(
        this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory
    ),
    byHierarchical: this.service.getgmHierarchicalDeviation(
        this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory,
      this.orderBy
    ),
    byAwwSuperviosrDeviation: this.service.getDeviationByAwwSuperviosr(
           this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory
    )
  }).subscribe({
    next: (res) => {
      this.stateLevelData = [
            res.observation.data,
            res.awc.data,
            res.supervisor.data,
            res.trendsbysupervisor.data,
            res.ageGroup.data,
            res.byHierarchical.data,
            res.byAwwSuperviosrDeviation?.data
          ];
      // const supervisorData = res.supervisor.data
      // const trendsbysupervisorData = res.trendsbysupervisor.data

      console.log(this.stateLevelData);
      

      if (this.stateLevelData) {
        this.createBarChartAWCDevaition(this.stateLevelData?.[1]);
        this.createBarChartSupervisorDevaition(this.stateLevelData?.[3])
        this.createBarChartAgegroupDevaition(this.stateLevelData?.[4])
        this.createDistrictBarChart(this.stateLevelData?.[5])
      } else {
        console.log('No month wise % AWC with deviation');
        this.clearAllData();
      }
      
      console.log('latell nnana check ',this.createBarChartAWCDevaition);
      
    
      this.isLoading = false;

      if (!this.selectedDistrict && !this.selectedBlock && !this.selectedSector) {
        this.loadDistrictData();
      }
    },
    error: (err) => {
      this.isLoading = false;
      this.clearAllData();
      console.error('Dashboard API Error:', err);
    }
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
            
          
              private createDistrictBarChart(data: any): void {
        console.log('Creating bar chart with data:', data);

        // Safely check if district_wise_deviation exists and has items
        if (data && data.deviation && Array.isArray(data.deviation) && data.deviation.length > 0) {
          this.barChartLabels = data.deviation.map(item => item.name.toUpperCase());

          this.barChartData = {
            labels: this.barChartLabels,
            datasets: [
              {
                data: data.deviation.map(item => parseFloat(item.percentage.replace('%', ''))),
                backgroundColor: '#5D87FF',
                hoverBackgroundColor: '#4a6cd8',
                borderRadius: 6,
                barThickness: 30,
              }
            ]
          };

          this.getTableData(data);
        } else {
          // Handle empty data case
          console.warn('No district_wise_deviation data available');
          this.barChartLabels = [];
          this.barChartData = {
            labels: [],
            datasets: [
              {
                data: [],
                backgroundColor: '#5D87FF',
                hoverBackgroundColor: '#4a6cd8',
                borderRadius: 6,
                barThickness: 30,
              }
            ]
          };
          this.dataSource.data = [];
        }
      }

       private createBarChartAWCDevaition(data: any): void {
          console.log('Creating AWC deviation chart with data:', data);
          
          // Check if data exists AND is an array with items
          if (data && Array.isArray(data) && data.length > 0) {
            this.barChartAWCDeviationLabels = data.map(item => item?.month.toUpperCase());
            
            this.barChartAWCDeviation = {
              labels: [...this.barChartAWCDeviationLabels],
              datasets: [{
                data: data.map(item => parseFloat(item?.percent_non_zero_diff.toString().replace('%', ''))),
                backgroundColor: '#5D87FF',
                hoverBackgroundColor: '#4a6cd8',
                borderRadius: 6,
                barThickness: 30,
              }]
            };
            
            console.log('Updated barChartAWCDeviation:', this.barChartAWCDeviation);
          } else {
            // Clear chart if no valid data
            console.warn('No valid AWC deviation data available');
            this.barChartAWCDeviation = {
              labels: [],
              datasets: [{
                data: [],
                backgroundColor: '#5D87FF',
                hoverBackgroundColor: '#4a6cd8',
                borderRadius: 6,
                barThickness: 30,
              }]
            };
          }
        }

     private createBarChartSupervisorDevaition(data: any): void {
      console.log('Creating bar chart with data:', data);
          
      if (data?.deviation_supervisor_reporting?.length > 0) {
           this.barChartSupervisorDeviationLabels = data?.deviation_supervisor_reporting?.map(item => item.month.toUpperCase());
    
        this.barChartSupervisorDeviation = {
          labels: this.barChartSupervisorDeviationLabels,
          datasets: [
            {
              data: data?.deviation_supervisor_reporting?.map(item => item?.deviation),
              // label: '% of supervisors reporting 100% deviation',
              backgroundColor: '#5D87FF',
              hoverBackgroundColor: '#4a6cd8',
              borderRadius: 6,
              barThickness: 30,
            }
          ]
        };
          } 

    }

      private createBarChartAgegroupDevaition(data: any): void {
      console.log('Creating bar chart with data:', data?.age_wise_deviation);
          
      if (data?.age_wise_deviation?.length > 0) {
           this.barChartAgegroupDeviationLabels = data?.age_wise_deviation?.map(item => item.age_group);
    
        this.barChartAgegroupDeviation = {
          labels: this.barChartAgegroupDeviationLabels,
          datasets: [
            {
              data: data?.age_wise_deviation?.map(item => item?.percentage),
              // label: 'Age group wise deviation %',
              backgroundColor: '#5D87FF',
              hoverBackgroundColor: '#4a6cd8',
              borderRadius: 6,
              barThickness: 30,
            }
          ]
        };

         console.log(this.barChartAgegroupDeviation);
          } 

      
       
    }

    
    
        private setupTableSorting(): void {
              if (!this.sort) {
    console.warn('MatSort not available yet, retrying...');
    setTimeout(() => this.setupTableSorting(), 100);
    return;
  }

            if (!this.dataSource) {
              console.warn('DataSource not available');
              return;
            }
        if (this.sort && this.dataSource) {
          this.dataSource.sort = this.sort;

          this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
            switch (sortHeaderId) {
              case 'district':
                return data.district?.toLowerCase();
              case 'slNo':
                return Number(data.slNo);
              case 'totalChildrenPresent':
                return Number(data.totalChildrenPresent);
              case 'childrenNoDeviation':
                return Number(data.childrenNoDeviation);
              case 'childrenDeviationCount':
                return Number(data.childrenDeviationCount);
              case 'deviationPercentage':
                return Number(data.deviationPercentage);
              default:
                return data[sortHeaderId];
            }
          };
        }
}

    
     getTableData(apiData: any) {
      if (apiData) {
        const formatted = apiData?.deviation.map((item, index) => ({
          slNo: index + 1,
          district: item.name,
          totalChildrenPresent: item?.total_count,
          childrenNoDeviation: item?.total_count - item?.deviation_count,
          childrenDeviationCount: item?.deviation_count,
            deviationPercentage: typeof item?.percentage === 'string' 
        ? parseFloat(item.percentage.replace('%', '')) 
        : item?.percentage,
        }));
    
        this.dataSource.data = formatted;
        
        // Set up sorting after data is loaded
        setTimeout(() => {
          this.setupTableSorting();
        });
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
              a?.name?.localeCompare(b?.name)
            );
    
    
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Statewise API Error:', err);
          },
        });
      }
    
       onFilterChange(): void {
      console.log('Filter changed - Year:', this.selectedYear, 'Month:', this.selectedMonth);
      
      // Clear current data
      this.clearAllData();
      
      // Update header title based on current selection
      if (this.selectedSector) {
        this.headerTitile = 'ICDS - Growth Monitoring (CDPO)';
      } else if (this.selectedBlock) {
        this.headerTitile = 'ICDS - Growth Monitoring (DPO)';
      } else if (this.selectedDistrict) {
        this.headerTitile = 'ICDS - Growth Monitoring (DPO)';
      } else {
        this.headerTitile = 'ICDS - Growth Monitoring (State)';
      }
      
      // Load data with current filters
      this.loadDashboardData();
    }
     
     onToggleChangeForAWCDeviation(value: boolean): void {
           this.isToggleOn = value;
         if(value == true){
            this.labelChanges.stateAWCDeviationTrendsChart = "Month-wise % samples with deviation"
            this.createBarChartAWCDevaition(this.stateLevelData?.[0])
         } else if (value == false){
            this.labelChanges.stateAWCDeviationTrendsChart = "Month-wise % AWC's with deviation"
            this.createBarChartAWCDevaition(this.stateLevelData?.[1])
         }
      }
    
      onToggleChangeForSupervisorDeviation(value: boolean): void {
        this.isToggleOnForSupervisor = value;
        if(value == true){
            this.labelChanges.stateSupervisorDeviationTrendsChart = "% of supervisors reporting 0% deviation"
            this.createBarChartSupervisorDevaition(this.stateLevelData?.[2])
        }else if (value == false){
            this.labelChanges.stateSupervisorDeviationTrendsChart = "% of supervisors reporting 100% deviation"
            this.createBarChartSupervisorDevaition(this.stateLevelData?.[3])
        }
      }

      
      onToggleChangeForHierarchicalDeviation(value: boolean): void {
        this.isToggleOnForHierarchical = value;
        if (value === true) {
          if(this.selectedDistrict && !this.selectedBlock){
               this.labelChanges.barchart = "Block wise % samples with deviation";
          } else if(this.selectedBlock && this.selectedDistrict){
               this.labelChanges.barchart = "Sector wise % samples with deviation";
          } else {
               this.labelChanges.barchart = "District wise % samples with deviation";
          }
          

          this.service.getgmHierarchicalDeviation(
              this.selectedYear,
              this.selectedMonth,
              this.selectedDistrict,
              this.selectedBlock,
              this.selectedSector,
              this.selectedDeviationCategory
          ).subscribe({
            next: (response) => {
              console.log("Deviation data (Samples):", response);
              this.createDistrictBarChart(response?.data || []);
            },
            error: (err) => {
              console.error("Error fetching deviation data:", err);
            },
          });

        } else {
            if(this.selectedDistrict && !this.selectedBlock){
               this.labelChanges.barchart = "Block wise % AWC's with deviation";
          } else if(this.selectedBlock && this.selectedDistrict){
               this.labelChanges.barchart = "Sector wise % AWC's with deviation";
          } else {
               this.labelChanges.barchart = "District wise % AWC's with deviation";
          }

           this.service.getgmHierarchicalDeviation(
              this.selectedYear,
              this.selectedMonth,
              this.selectedDistrict,
              this.selectedBlock,
              this.selectedSector,
              this.selectedDeviationCategory,
              this.orderBy
          ).subscribe({
            next: (response) => {
              console.log("Deviation data (AWCs):", response);
              this.createDistrictBarChart(response?.data || []);
            },
            error: (err) => {
              console.error("Error fetching deviation data:", err);
            },
          });
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
           stateChildDeviation: "No.of children with deviation",
        statePercentageChildDeviation: "% of children with deviation",
        stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
        stateBySupervisorNoDeviationThisMonth: "% reporting no deviations this month",
        stateBySupervisor100DeviationThisMonth: "% reporting 100% deviations this month",
        stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
        stateSupervisorDeviationTrendsChart: "% of supervisors reporting 100% deviation",
        stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
        barchart: "District wise % of AWC's with deviation",
        sectionType:"District"
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
      console.log('District changed to:', val);
    
      // Clear dependent data immediately
      this.blockData = [];
      this.sectorData = [];
      this.selectedBlock = '';
      this.selectedSector = '';
      
      // Clear current dashboard data
      this.clearAllData();
    
      this.headerTitile = 'ICDS - Growth Monitoring (DPO)';
    
      if (this.selectedDistrict || this.selectedDistrict === "") {
        // Load block data first
        this.loadBlockData(this.selectedDistrict);
    
        const districtName = this.districtData.find(district => district.district_id == this.selectedDistrict);
        console.log(districtName, 'districtName');
    
        if (this.selectedDistrict) {
          this.labelChanges = {
        stateChildDeviation: "No.of children with deviation",
        statePercentageChildDeviation: "% of children with deviation",
        stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
        stateBySupervisorNoDeviationThisMonth: "% reporting no deviations this month",
        stateBySupervisor100DeviationThisMonth: "% reporting 100% deviations this month",
        stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
        stateSupervisorDeviationTrendsChart: "% of supervisors reporting 100% deviation",
        stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
        barchart: "Block wise % of AWC`s with deviation",
        sectionType:"Block"
      }
      
        }
        
        // Load dashboard data with new district
        this.loadDashboardData();
      }
    }
    
       onBlockChange(): void {
      console.log('Block changed to:', this.selectedBlock);
      
      // Clear dependent data
      this.sectorData = [];
      this.selectedSector = '';
      
      // Clear current dashboard data
      this.clearAllData();
    
      this.headerTitile = 'ICDS - Growth Monitoring (DPO)';
      
      if (this.selectedBlock) {
        // Load sector data first
        this.loadSectorData(this.selectedBlock);
    
        const blockName = this.blockData.find(block => block.block_id == this.selectedBlock);
    
        if (this.selectedBlock) {
              this.labelChanges = {
        stateChildDeviation: "No.of children with deviation",
        statePercentageChildDeviation: "% of children with deviation",
        stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
        stateBySupervisorNoDeviationThisMonth: "% reporting no deviations this month",
        stateBySupervisor100DeviationThisMonth: "% reporting 100% deviations this month",
        stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
        stateSupervisorDeviationTrendsChart: "% of supervisors reporting 100% deviation",
        stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
        barchart: "Sector wise % of AWC`s with deviation",
        sectionType:"Sector"
      }
        }
        
        // Load dashboard data with new block
        this.loadDashboardData();
      }
    }
    

     onDeviationChange(): void {
        console.log("Selected Deviation:", this.selectedDeviationCategory);
         this.loadDashboardData();
      }


    
    
    
         sortChartData(order: 'asc' | 'desc', type: string) {
              let sorted = [];

              if (type === 'number') {
                sorted = [...(this.stateLevelData?.[5]?.deviation || [])].sort((a, b) => {
                  const percentA = parseFloat(a.percentage.toString().replace('%', ''));
                  const percentB = parseFloat(b.percentage.toString().replace('%', ''));
                  
                  return order === 'asc'
                    ? percentA - percentB
                    : percentB - percentA;
                });
              } else {
                sorted = [...(this.stateLevelData?.[5]?.deviation || [])].sort((a, b) => {
                  return order === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
                });
              }

              console.log('Sorted data:', sorted);

              this.barChartLabels = sorted.map(item => item.name);

              this.barChartData = {
                labels: this.barChartLabels,
                datasets: [
                  {
                    data: sorted.map(item => parseFloat(item.percentage.toString().replace('%', ''))),
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
    
            this.blockData = res?.data?.result?.sort((a:any,b:any)=>(
              a.block_name.localeCompare(b.block_name)
            ));
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
