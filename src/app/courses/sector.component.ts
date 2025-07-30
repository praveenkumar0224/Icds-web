import { Component, OnInit,ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ChartOptions, ChartType, ChartData } from 'chart.js';

interface DashboardData {
  awcsObserved: number;
  awcsNotObserved: number;
  observationTrends: Array<{month: string, value: number}>;
  notVisitedTrends: Array<{month: string, value: number}>;
  observationsByBlock: Array<{block: string, count: number}>;
  observationsByCadre: Array<{cadre: string, count: number}>;
}


@Component({
  selector: 'app-courses',
  templateUrl: './sector.component.html',
  styleUrls: ['./sector.component.scss']
})
export class SectorComponent implements OnInit {
  // Line chart

public observationTrendData: ChartData<'line'> = {
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
};


// Not Visited Trend Line Chart
public notCadreData: ChartData<'line'> = {
  labels: ['Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20, 120, 220],
      label: 'Not Visited',
      fill: false,
      tension: 0.4,
      borderColor: '#008000',
      pointBackgroundColor: '#008000',
      backgroundColor: '#f57c00'
    }
  ]
};


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

// Line Chart Options
public lineChartCadreOptions: ChartOptions<'line'> = {
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

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
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
  };

  public barChartData: ChartData<'bar'> = {
    labels: [
      'Sector 1',
      'Sector 2',
      'Sector 3',
      'Sector 4',
      'Sector 5',
      'Sector 6',
     
    ],
    datasets: [
      {
        label: 'AWC Count',
        data: [1200, 1300, 2500, 2600, 2700,2600 ],
        backgroundColor: [
          '#5d87ff', '#5d87ff', '#5d87ff',
          '#5d87ff', '#5d87ff', '#5d87ff', '#FF6384' // example: last bar highlighted
        ],
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  };




  
  selectedYear = '2025';
  selectedMonth = 'July';
  selectedBlock = 'All Blocks';
  selectedSector = 'All Sectors';
  
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




  constructor(private http: HttpClient) {

   

   
  
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  goBack() {
    window.history.back();
  }
  loadDashboardData(): void {
    // Replace with your actual API endpoint
    // this.http.get<DashboardData>('/api/dashboard-data').subscribe(
    //   data => {
    //     this.dashboardData = data;
    //   },
    //   error => {
    //     console.error('Error loading dashboard data:', error);
    //   }
    // );
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
}