import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { CoursesService } from '../shared/services/courses/courses.service';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MatSort } from '@angular/material/sort';


interface DashboardData {
  awcsObserved: number;
  awcsNotObserved: number;
  observationTrends: Array<{ month: string, value: number }>;
  notVisitedTrends: Array<{ month: string, value: number }>;
  observationsByBlock: Array<{ block: string, count: number }>;
  observationsByCadre: Array<{ cadre: string, count: number }>;
}


@Component({
  selector: 'app-examples',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.scss']
})
export class DistrictComponent implements OnInit {

  isLoading = false;
  blockData: any[] = [];
  districtId:any;
  sectorData: any[] = [];
  districtLevelData: any;
  // Line chart
  showChart = true;
  displayedColumns: string[] = ['slNo', 'district', 'available', 'observed'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

  @ViewChild('chartCanvas') chartCanvas;

  @ViewChild(MatSort) sort: MatSort;
  sortDirection: 'asc' | 'desc' = 'asc';


    // Line chart
    public observationTrendData: ChartData<'line'>;
    public notVisitedTrendData: ChartData<'line'>;


  toggleView() {
    this.showChart = !this.showChart;
  }

  /* public observationTrendData: ChartData<'line'> = {
    labels: ['Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [150, 180, 320],
        label: 'Observed',
        fill: false,
        tension: 0.4,
        borderColor: '#1976d2',
        pointBackgroundColor: '#1976d2',
        backgroundColor: '#1976d2'
      }
    ]
  };

  // Not Visited Trend Line Chart
  public notVisitedTrendData: ChartData<'line'> = {
    labels: ['Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [220, 180, 120],
        label: 'Not Visited',
        fill: false,
        tension: 0.4,
        borderColor: '#f57c00',
        pointBackgroundColor: '#f57c00',
        backgroundColor: '#f57c00'
      }
    ]
  }; */

  // Line Chart Options
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Observations by Cadre Horizontal Bar Chart
  public cadreChartData: ChartData<'bar'> = {
    labels: ['Supervisor', 'Sector Officer', 'CDPO'],
    datasets: [
      {
        label: 'Observations',
        data: [120, 80, 60],
        backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726'],
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  };

  public horizontalBarOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { beginAtZero: true }
    }
  };



  /// Bar Chart  
/* 
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label || ''}: ${context.parsed.y} AWCs`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 12 }, maxRotation: 90, minRotation: 45 },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'AWC Count' }
      }
    }
  }; */

  public barChartOptions: ChartOptions<'bar'> = {
    
    
    responsive: true,
    onClick: (event, elements, chart) => {
      console.log('Test',event, elements, chart);
      
      if (elements.length > 0) {
      const index = elements[0].index;
      const selectedblock = this.districtLevelData?.awc_observed_by_month[index];
      console.log('selectedDistrict',selectedblock);
      this.navigateToDetailPage(selectedblock);

      
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

  navigateToDetailPage(selectedblock) {
    this.router.navigate(['/courses', selectedblock.id]);
  }

  /* public barChartData: ChartData<'bar'> = {
    labels: [
      'ARIYALUR',
      'CHENGALPATTU',
      'CHENNAI',
      'COIMBATORE',
      'CUDDALORE',
      'DHARMAPURI',
      'DINDIGUL',

    ],
    datasets: [
      {
        label: 'AWC Count',
        data: [1100, 1200, 1300, 2500, 1300, 2500, , 2300],
        backgroundColor: [
          '#5d87ff', '#5d87ff', '#5d87ff',
          '#5d87ff', '#5d87ff', '#5d87ff', '#FF6384' // example: last bar highlighted
        ],
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  }; */



  public barChartData: ChartData<'bar'> = this.getBarChartData();

  selectedYear = '2025';
  selectedMonth = '7';
  selectedBlock = '';
  selectedSector = '';

  dashboardData: DashboardData = {
    awcsObserved: 1200,
    awcsNotObserved: 800,
    observationTrends: [
      { month: 'Apr', value: 900 },
      { month: 'May', value: 400 },
      { month: 'Jun', value: 1200 }
    ],
    notVisitedTrends: [
      { month: 'Apr', value: 3 },
      { month: 'May', value: 8 },
      { month: 'Jun', value: 16 }
    ],
    observationsByBlock: [
      { block: 'Andimadam', count: 150 },
      { block: 'Ariyalur', count: 140 },
      { block: 'Jayankondam', count: 160 },
      { block: 'Sendurai', count: 200 },
      { block: 'T.Palur', count: 180 },
      { block: 'Thirumanur', count: 170 },
      { block: 'District Average', count: 165 }
    ],
    observationsByCadre: [
      { cadre: 'DPO', count: 80 },
      { cadre: 'CDPO', count: 192 },
      { cadre: 'Supervisors', count: 928 }
    ]
  };

  sideMenuOpen = true;
  activeMenuItem = 'overview';




  constructor(private http: HttpClient, private router: Router,private route: ActivatedRoute,private service: CoursesService,) {

  }



  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.districtId = params['id'];
      console.log(this.districtId, 'districtId');
      if( this.districtId){
        this.loadBlockData(this.districtId);
      }

      //this.loadDistrictData(districtId); // Call your data loader here
    });

    this.loadDashboardData();
  }
  goBack() {
    window.history.back();
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
    const labels = this.districtLevelData?.awc_observed_by_month.map(item => item.name.toUpperCase());
    const data = this.districtLevelData?.awc_observed_by_month.map(item => item.total_observed);

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




  onBlockChange() {
    if (this.selectedBlock) {
      this.loadSectorData(this.selectedBlock);
      this.loadDashboardData()
    }
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

  loadDashboardData(): void {
    // Load state Api
    this.isLoading = true;
    this.service
      .getDistrictWiseData(this.districtId,this.selectedYear, this.selectedMonth,this.selectedBlock)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log(res, 'dashboard data ');
          this.districtLevelData = res.data;
          if (this.districtLevelData?.awc_observed_by_month?.length) {
            this.updateBarChartData(this.districtLevelData?.awc_observed_by_month);

            this.setObservationTrendData(this.districtLevelData?.observation_visited_trend);
            this.setNotVisitedTrendData(this.districtLevelData?.observation_not_visited_trend);

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



  //Master Api call

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







  toggleSideMenu(): void {
    this.sideMenuOpen = !this.sideMenuOpen;
  }

  setActiveMenuItem(item: string): void {
    this.activeMenuItem = item;

  }

  onFilterChange(): void {
    // Implement filter logic here
    if(this.selectedSector){
      this.loadDashboardData();
    }
   
  }

  getObservationPercentage(): number {
    const total = this.dashboardData.awcsObserved + this.dashboardData.awcsNotObserved;
    return Math.round((this.dashboardData.awcsObserved / total) * 100);
  }

  getMaxBlockValue(): number {
    return Math.max(...this.dashboardData.observationsByBlock.map(b => b.count));
  }

  getMaxTrendValue(): number {
    return Math.max(...this.dashboardData.observationTrends.map(t => t.value));
  }

  getMaxNotVisitedValue(): number {
    return Math.max(...this.dashboardData.notVisitedTrends.map(t => t.value));
  }

  getMaxCadreValue(): number {
    return Math.max(...this.dashboardData.observationsByCadre.map(c => c.count));
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