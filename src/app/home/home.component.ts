import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatSort } from '@angular/material/sort';
import { CoursesService } from '../shared/services/courses/courses.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
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
export class HomeComponent implements OnInit {
  showChart = true;
  isLoading = false;

  stateLevelData: any;
  districtData: any[] = [];
  blockData: any[] = [];
  sectorData: any[] = [];
  @ViewChild('chartCanvas') chartCanvas;

  @ViewChild(MatSort) sort!: MatSort;
  sortDirection: 'asc' | 'desc' = 'asc';

  toggleView() {
    this.showChart = !this.showChart;
  }

  dashboardStatusData = {
    completed: 194,
    inProgress: 45,
    notCompleted: 21,
  };

  displayedColumns: string[] = ['slNo', 'district', 'available', 'observed'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

  goBack() {
    window.history.back();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'slNo':
          return this.dataSource.data.indexOf(data) + 1;
        case 'district':
          return data.district;
        case 'available':
          return data.available;
        case 'observed':
          return data.observed;
        default:
          return data[sortHeaderId];
      }
    };
    
  }
  // Line chart
  public observationTrendData: ChartData<'line'>;
  public notVisitedTrendData: ChartData<'line'>;



  // Line Chart Options
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  public barChartOptions: ChartOptions<'bar'> = {
    
    
    responsive: true,
    onClick: (event, elements, chart) => {
      console.log('Test',event, elements, chart);
      
      if (elements.length > 0) {
      const index = elements[0].index;
      const selectedDistrict = this.stateLevelData?.awc_observed_by_month[index];
      console.log('selectedDistrict',selectedDistrict);
      this.navigateToDetailPage(selectedDistrict);

      
      }

     /*  if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const label = chart.data.labels?.[elementIndex] as string;

        if (label) {
          this.navigateToDetailPage(label);
        }
      } */
    }
  };

  navigateToDetailPage(districtDetials) {
    this.router.navigate(['/examples', districtDetials.id]);
  }

  // Observations by Cadre Horizontal Bar Chart
  public cadreChartData: ChartData<'bar'> = {
    labels: ['Supervisor', 'Sector Officer', 'CDPO'],
    datasets: [
      {
        label: 'Observations',
        data: [120, 80, 60],
        backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726'],
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  public horizontalBarOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true },
    },
  };



  public barChartData: ChartData<'bar'> = this.getBarChartData();


  selectedYear = '2025';
  selectedMonth = '7';
  selectedBlock = '';
  selectedSector = '';

 

  sideMenuOpen = true;
  activeMenuItem = 'overview';
  selectedDistrict: string = '';


  constructor(private service: CoursesService, private router: Router) { }

  ngOnInit(): void {
    console.log('test');
    console.log('test');

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
          this.loadDistrictData();
        },
        error: (err) => {
          console.error('Error:', err);
        },
      });
  }


  updateBarChartData(awc_observed_by_month: any[]): void {
    const labels = awc_observed_by_month.map(item => item.name.toUpperCase());
    const data = awc_observed_by_month.map(item => item.total_observed);

    this.barChartData.labels = labels;
    this.barChartData.datasets[0].data = data;

    this.dataSource = new MatTableDataSource(
      awc_observed_by_month.map((item, index) => ({
        slNo: index + 1,
        district: item.name,
        available: item.not_started,
        observed: item.total_observed,
      }))
    );

  }

  private getBarChartData(): ChartData<'bar'> {
    const labels = this.stateLevelData?.awc_observed_by_month.map(item => item.name.toUpperCase());
    const data = this.stateLevelData?.awc_observed_by_month.map(item => item.total_observed);

    return {
      labels: labels,
      datasets: [
        {
          label: 'AWC observed count',
          data: data,
          backgroundColor: new Array(38).fill('#5d87ff'),
          borderRadius: 6,
          barPercentage: 0.8,
        },
      ],
    };
  }



  
  loadDashboardData(): void {
    // Load state Api
    this.isLoading = true;
    
    this.service
      .getStatewiseData(this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log(res, 'dashboard data ');
          this.stateLevelData = res.data;
          if (this.stateLevelData?.awc_observed_by_month?.length) {
            this.updateBarChartData(this.stateLevelData?.awc_observed_by_month);

            this.setObservationTrendData(this.stateLevelData?.observation_visited_trend);
            this.setNotVisitedTrendData(this.stateLevelData?.observation_not_visited_trend);

          }


        },
        error: (err) => {
          this.isLoading = false;
          console.error('Statewise API Error:', err);
        },
      });
  }

  // 3 month chart 

  setObservationTrendData(lineChatdata: any): void {

    const labels = lineChatdata.map(item => item.month.toUpperCase());
    const data = lineChatdata.map(item => item.total_observed);

    this.observationTrendData = {
      labels,
      datasets: [
        {
          data,
          label: 'Observed',
          fill: false,
          tension: 0.4,
          borderColor: '#1976d2',
          pointBackgroundColor: '#1976d2',
          backgroundColor: '#1976d2',
        },
      ],
    };
  }

  setNotVisitedTrendData(lineChatdata: any): void {

    const labels = lineChatdata.map(item => item.month.toUpperCase());
    const data = lineChatdata.map(item => item.not_started);

    this.notVisitedTrendData = {
      labels,
      datasets: [
        {
          data,
          label: 'Not Visited',
          fill: false,
          tension: 0.4,
          borderColor: '#f57c00',
          pointBackgroundColor: '#f57c00',
          backgroundColor: '#f57c00',
        },
      ],
    };
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


        this.districtData  =  res?.data?.result?.sort((a: any, b: any) =>
        a.district_name.localeCompare(b.district_name)
      );

        this;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Statewise API Error:', err);
      },
    });
  }

  onDistrictChange() {
    if (this.selectedDistrict) {
      this.loadBlockData(this.selectedDistrict);
    }
  }

  onBlockChange() {
    if (this.selectedBlock) {
      this.loadSectorData(this.selectedBlock);
    }
  }

  loadBlockData(districtId): void {
    // Load state Api
    this.isLoading = true;
    this.service.postBlockData(districtId).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res, 'Block Data ');
        this.blockData = res?.data?.result;
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
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Statewise API Error:', err);
      },
    });
  }

  toggleSideMenu(): void {
    this.sideMenuOpen = !this.sideMenuOpen;
  }

  setActiveMenuItem(item: string): void {
    this.activeMenuItem = item;
  }

  onFilterChange(): void {
    // Implement filter logic here

    this.loadDashboardData();
  }



  downloadExcel() {
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

  downloadChart() {
    const chartEl = document.getElementById('chartCanvas') as HTMLCanvasElement;
    if (chartEl) {
      const url = chartEl.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'awc-observation-chart.png';
      link.click();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sort.active = 'observed';
    this.sort.direction = this.sortDirection;
    this.sort.sortChange.emit({
      active: 'observed',
      direction: this.sortDirection,
    });
  }




}
