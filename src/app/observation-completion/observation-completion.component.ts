import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DashboardServiceService } from "../shared/services/dashboard-service.service";
import { Router } from "@angular/router";
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Chart, ChartConfiguration, ChartData, ChartType, DoughnutController, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { MatSort } from '@angular/material/sort';


import { TableConfig } from '../common/dynamic-table-chart/dynamic-table-chart.model';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
@Component({
  selector: 'app-observation-completion',
  templateUrl: './observation-completion.component.html',
  styleUrls: ['./observation-completion.component.scss', '../app.component.scss']
})


export class ObservationCompletionComponent implements OnInit {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart1') lineChartChart1Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart2') lineChartChart2Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart3') lineChartChart3Ref!: ElementRef<HTMLCanvasElement>;


  @ViewChild(MatSort) sort!: MatSort;
  localUser = localStorage.getItem('user');
  user = JSON.parse(this.localUser)
  role = this.user?.role?.role_name
  isDistrictDisable = false;
  isBlockDisable = false;
  isAccess = true;
  isStateUser = false;
  isDistrictUser = false;
  isBlockUser = false;


  showChart = true;
  headerTitile: string = "ICDS - Observation completion";
  isLoading = false;
  stateLevelData: any;
  districtData: any[] = [];
  blockData: any[] = [];
  sectorData: any[] = [];
  toggleUsers = ['Block Supervisor', 'CDPO', 'DPO'];

  supervisorChart?: Chart<'doughnut', number[], unknown>;
  CDPOChart?: Chart<'doughnut', number[], unknown>;
  DPOChart?: Chart<'doughnut', number[], unknown>;




  isLoadingForSupervisorObservationCompletion = false;
  supervisorObservationCompletionData: any;

  isLoadingForCDPOObservationCompletion = false;
  cdpoObservationCompletionData: any;

  isLoadingForSupervisorActive = false;
  supervisorActiveData: any;

  isLoadingForCDPOActive = false;
  cdpoActiveData: any;

  isLoadingForDPOActive = false;
  dpoActiveData: any;


  isLoadingSectorsObservedByDpo = false;
  sectorsObservedByDpoData: any;


  isLoadingForSupervisorTrends = false;
  supervisorTrendsData: any;

  isLoadingForCDPOTrends = false;
  dpoTrendsData: any;

  isLoadingForDPOrTrends = false;
  cdpoTrendsData: any;


  selectedYear: string | number;
  years: number[] = [];

  selectedMonth: string = (new Date().getMonth() + 1).toString();
  currentYear = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1;

  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  selectedDistrict = "";
  selectedBlock = "";
  selectedSector = "";



  selectedRole: any = 'Block Supervisor'; // default
  //line-charts






  lineChart = 'line'
  selectedTabIndex = 0;
  chartSortOrder: 'asc' | 'desc' = 'asc';
  alphaSortOrder: 'asc' | 'desc' = 'asc';
  barChartLabels: string[] = [];
  supervisorChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '% Completion',
        fill: false,
        tension: 9.4,

      },

    ]
  };



  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Centers Observed Percentage',
        // backgroundColor: '#5D87FF',
        // hoverBackgroundColor: '#4a6cd8',
        borderRadius: 6,
        barThickness: 40
      }
    ]
  }

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
          callback: function (value) {
            return value + '%';
          }
        }
      }
    }
  };

  // CDPO (Quarterly)
  cdpoChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '% Completion',
        fill: false,
        tension: 0.4
      }
    ]
  };

  // DPO (Quarterly)
  dpoChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '% Completion',
        fill: false,
        tension: 0.4
      }
    ]
  };

  barChartUnVisitedAwcCountSupervisorLabels: string[] = [];

  barChartUnVisitedAwcCountSupervisor: ChartData<"bar"> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: "",
        backgroundColor: "#5D87FF",
        hoverBackgroundColor: "#4a6cd8",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  barChartUnVisitedAwcCountSupervisorOptions: ChartOptions<'bar'> = {
    // responsive: true,
    // maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };



  chartType: ChartType = 'line';

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: '% completion'
        }
      }
    }
  };


  //tableConfig base 

  tableConfig: TableConfig = {
    enableSearch: true,
    columns: [
      { key: 'slNo', label: 'Sl.No', sortable: true, align: 'center' },
      { key: 'sector', label: 'Sector Name', clickable: true },
      { key: 'totalAwc', label: 'Total AWC', align: 'center' },
      { key: 'deviationCount', label: 'AWC deviation count', align: 'center' },
      { key: 'percentage', label: 'Deviation %', align: 'center', suffix: '%' }
    ]
  };

  headerConfig = {
    title: 'Sector wise % of AWC’s with deviation',
    sectionType: 'Sector',
    showExcelDownload: true,
    showChartDownload: true
  };
  tableData: any[] = [];

  chartConfig = {
    enabled: true,
    enableSort: true,
    labelColumnKey: '',
    dataColumnKey: '',
    chartLabel: '',
    // backgroundColor: '#5D87FF',
    chartFileName: 'dpo-observation.png',
    options: {}
  };



  constructor(
    private service: DashboardServiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (!sessionStorage.getItem('reloaded')) {
      sessionStorage.setItem('reloaded', 'true');
      window.location.reload();
    } else {
      sessionStorage.removeItem('reloaded');
  
      this.findingYear();
      this.getAccessForthisComponent();
      this.loadDistrictData();
  
      if (this.isStateUser) {
        this.loadAllDashboardData();
      }
  
      console.log(this.user , "user betaaa", this.role , "role betaaa");
    }
  }
  getAccessForthisComponent(): void {

    switch (this.role) {
      case "DPO":
        this.isDistrictUser = true;
        break;
      case "CDPO":
        this.isBlockUser = true
        break;
      case "Block Supervisor":
        this.isAccess = false;
        break;
      case "Root":
        this.isStateUser = true
        break
      case "District Collector":
        this.isDistrictUser = true
        break
      case "Zone Officer":
        this.isStateUser = true
        break
      case "District Coordinator":
        this.isDistrictUser = true
        break
      default:
        this.isDistrictDisable = false;
        this.isBlockDisable = false;
        this.isAccess = true;
    }
    console.log(this.isStateUser, "isStateUser");

  }
   get visibleRoles(): any {
        // State view
        if (this.isStateUser) {
          // District + Block both selected → hide DPO
          if (this.selectedDistrict && this.selectedBlock) {
            return this.toggleUsers.filter(r => r !== 'DPO');
          }
          return this.toggleUsers;
        }

        // Non-state view
           if (this.role === 'DPO') {
            // Block selected → hide toggle entirely
            if (this.selectedBlock) {
              return this.toggleUsers.filter(r => r !== 'DPO');
            }
            // No block selected (district prefilled or not) → show Block Supervisor + CDPO
            return this.toggleUsers
          }
        if (this.role === 'CDPO') {
          return this.toggleUsers.filter(r => r !== 'DPO' && r !== 'CDPO');
        }

        if (this.role === 'District Collector' || this.role === 'District Coordinator') {
            if (this.selectedBlock) {
              // Block selected → hide DPO from toggle
              return this.toggleUsers.filter(r => r !== 'DPO');
            }
              return this.toggleUsers
          }

  }

  findingYear(): void {
    const startYear = 2025;
    const endYear = 2030;

    this.years = [];
    for (let y = startYear; y <= endYear; y++) {
      this.years.push(y);
    }

    this.selectedYear = this.currentYear;
  }
  loadDistrictData(): void {
    this.isLoading = true;
    const payload: any = {
      filter: {
        is_active: true
      },
      options: {
        "sortBy":
          { "district_name": "asc" }

      }
    };

    if (this.isDistrictUser || this.isBlockUser) {
      payload.filter.district_id = this.user.district_id;
    }
    this.service.postDistrictDatWithFilter(payload).subscribe({
      next: (res) => {
        this,
          this.isLoading = false;
        console.log(res, "District Data");
        this.districtData = res?.data?.result || [];
        if (this.isDistrictUser || this.isBlockUser) {
          this.selectedDistrict = this.districtData[0].district_id;
          this.loadBlockData(this.selectedDistrict);
        }
        if (this.isDistrictUser) {
          this.loadAllDashboardData();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("District API Error:", err);
        this.snackBar.open("Error loading district data", "Close", {
          duration: 3000
        });
      },
    });
  }

  loadAllDashboardData(): void {

    this.tableData = [];

    if (this.isStateUser) {
      this.loadTableAndChartData()
      this.callSupervisorObservationCompletion();
      this.callCDPOObservationCompletion();
      this.callSupervisorActive();
      this.callCDPOActive();
      this.callDPOActive();
      this.getAwcObservedBySupervisor();
      this.getAwcObservedQuarterByDPO();
      this.getSectorsObservedByDPO();
      this.getAwcObservedQuarterByCDPO();
    }

    if (this.isDistrictUser) {
      this.loadTableAndChartData()
      this.callSupervisorObservationCompletion();
      this.callCDPOObservationCompletion();
      this.getAwcObservedBySupervisor();
      this.callSupervisorActive();
      this.callCDPOActive();
      this.getSectorsObservedByDPO();
      this.getAwcObservedQuarterByDPO();
      this.getAwcObservedQuarterByCDPO();
    }

    if (this.isBlockUser) {
      this.loadTableAndChartData()
      this.callCDPOObservationCompletion();
      this.getAwcObservedBySupervisor();
      this.callSupervisorObservationCompletion();
      this.callSupervisorActive();
      this.getAwcObservedQuarterByCDPO();
      this.getUnvisistedAwcForSupervisor()
    }
  }

  callSupervisorObservationCompletion(): void {
    this.isLoadingForSupervisorObservationCompletion = true;
    this.service
      .supervisorObs(
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForSupervisorObservationCompletion = false;
          console.log(res?.data, "callSupervisorObservationCompletion");

          this.supervisorObservationCompletionData = res?.data ?? {};
        },
        error: (err) => {
          this.isLoadingForSupervisorObservationCompletion = false;
          console.error("Error fetching supervisor observation completion:", err);
        },
      });
  }

  callCDPOObservationCompletion(): void {
    this.isLoadingForCDPOObservationCompletion = true;
    this.service
      .CDPOObs(
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForCDPOObservationCompletion = false;
          this.cdpoObservationCompletionData = res?.data ?? 0;
        },
        error: (err) => {
          this.isLoadingForCDPOObservationCompletion = false;
          console.error("Error fetching CDPO observation completion:", err);
        },
      });
  }



  callSupervisorActive(): void {
    this.isLoadingForSupervisorActive = true;

    this.service.supervisorActive(
      this.selectedDistrict,
      this.selectedYear.toString(),
      this.selectedMonth,
      this.selectedBlock,
      this.selectedSector
    ).subscribe({
      next: (res) => {
        this.isLoadingForSupervisorActive = false;
        this.supervisorActiveData = res?.data ?? {};

        const percent = Math.round(
          this.supervisorActiveData?.presentMonthActiveRate || 0
        );
        const actualNumber = this.supervisorActiveData?.activeSupervisorsPresentMonth || 0;

        setTimeout(() => {
          if (this.supervisorChart) {
            this.supervisorChart.destroy();
          }

          this.supervisorChart = new Chart(
            'supervisorChart',
            this.buildHalfDoughnut(percent, actualNumber)
          );
          console.log(this.supervisorChart);
        });


      },
      error: () => (this.isLoadingForSupervisorActive = false)
    });
  }

  callCDPOActive(): void {
    this.isLoadingForCDPOActive = true;
    this.service
      .CDPOActive(
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForCDPOActive = false;
          this.cdpoActiveData = res?.data ?? {
            presentMonthActiveRate: 0,
            lastMonthActiveRate: 0
          };

          const percent = Math.round(
            this.cdpoActiveData?.presentMonthActiveRate || 0
          );

          const actualNumber = this.cdpoActiveData?.activeSupervisorsPresentMonth || 0;

          setTimeout(() => {
            if (this.CDPOChart) {
              this.CDPOChart.destroy();
            }

            this.CDPOChart = new Chart(
              'CDPOChart',
              this.buildHalfDoughnut(percent, actualNumber)
            );
            console.log(this.CDPOChart);
          });



        },
        error: (err) => {
          this.isLoadingForCDPOActive = false;
          console.error("Error fetching CDPOActiveData:", err);
        },
      });
  }

  getAwcObserved(): void {
    this.isLoadingForDPOActive = true;
    this.service
      .DPOActive(  // Fixed: was calling CDPOActive instead
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForDPOActive = false;
          this.dpoActiveData = res?.data ?? {
            presentMonthActiveRate: 0,
            lastMonthActiveRate: 0
          };
        },
        error: (err) => {
          this.isLoadingForDPOActive = false;
          console.error("Error fetching DPOActiveData:", err);
        },
      });
  }

  getSectorsObservedByDPO(): void {
    this.isLoadingSectorsObservedByDpo = true;
    this.service
      .getSectorsObservedByDPO(  // Fixed: was calling CDPOActive instead
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingSectorsObservedByDpo = false;
          this.sectorsObservedByDpoData = res?.data ?? null;
          console.log(this.sectorsObservedByDpoData);

        },
        error: (err) => {
          this.isLoadingForDPOActive = false;
          console.error("Error fetching DPOActiveData:", err);
        },
      });
  }

  callDPOActive(): void {
    this.isLoadingForDPOActive = true;
    this.service
      .DPOActive(  // Fixed: was calling CDPOActive instead
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForDPOActive = false;
          this.dpoActiveData = res?.data ?? {
            presentMonthActiveRate: 0,
            lastMonthActiveRate: 0
          };
          const percent = Math.round(
            this.dpoActiveData?.presentMonthActiveRate || 0
          );

          const actualNumber = this.dpoActiveData?.activeSupervisorsPresentMonth || 0;
          
          console.log(this.isLoadingForDPOActive, "isLoadingForDPOActive");
          setTimeout(() => {
            if (this.DPOChart) {
              this.DPOChart.destroy();
            }

            this.DPOChart = new Chart(
              'DPOChart',
              this.buildHalfDoughnut(percent, actualNumber)
            );
            console.log(this.DPOChart);
          });

        },
        error: (err) => {
          this.isLoadingForDPOActive = false;
          console.error("Error fetching DPOActiveData:", err);
        },
      });
  }

  getAwcObservedBySupervisor(): void {
    this.isLoadingForSupervisorTrends = true;

    this.service
      .awcObservedBySupervisor(
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForSupervisorTrends = false;

          const data = res?.data?.formattedData ?? [];

          // 👉 Labels (Nov-2025, Dec-2025, Jan-2026)
          const labels = data.map((item: any) => item.year_month);

          const datasets: any[] = [];

          /** ---------- Supervisor (Current Scope) ---------- */
          datasets.push({
            data: data.map((item: any) =>
              Number(item.observed_percentage ?? 0)
            ),
            label: 'Supervisor AWC Observation %',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            borderColor: 'green',
            pointRadius: 5
          });

          /** ---------- District Line (only if exists) ---------- */

          const hasDistrictData = data.some(
            (item: any) => item.district_observed_percentage !== null
          );

          if (hasDistrictData) {
            datasets.push({
              data: data.map((item: any) =>
                item.district_observed_percentage !== null
                  ? Number(item.district_observed_percentage)
                  : null
              ),
              label: 'District Observation %',
              fill: false,
              tension: 0.4,
              borderWidth: 2,
              borderColor: 'blue',
              pointRadius: 4,
              // borderDash: [6, 4]   // 👈 optional: dashed line
            });
          }

          /** ---------- State Line (only if exists) ---------- */
          const hasStateData = data.some(
            (item: any) => item.state_observed_percentage !== null
          );

          if (hasStateData) {
            datasets.push({
              data: data.map((item: any) =>
                item.state_observed_percentage !== null
                  ? Number(item.state_observed_percentage)
                  : null
              ),
              label: 'State Observation %',
              fill: false,
              tension: 0.4,
              borderWidth: 2,
              borderColor: 'red',
              pointRadius: 4,
              // borderDash: [2, 2]   // 👈 optional: dotted line
            });
          }

          /** ---------- Final Chart ---------- */
          this.supervisorChartData = {
            labels,
            datasets
          };
        },
        error: () => {
          this.isLoadingForSupervisorTrends = false;
        }
      });
  }
    buildHalfDoughnut(percent: number, actualNumber: number) {
  return {
    type: 'doughnut' as const,
    data: {
      datasets: [
        {
          data: [percent, 100 - percent],
          backgroundColor: ['#5DA5DA', '#F4A6B8'],
          borderWidth: 0
        }
      ]
    },
    options: {
      aspectRatio: 2,
      circumference: 180,
      rotation: -90,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            title: () => '',
            label: (context) => {
              if (context.dataIndex === 0) {
                return `  Active: ${actualNumber}`;
              } else {
                return `  Inactive: ${100 - percent}%`;
              }
            }
          }
        }
      }
    }
  };
}

  getAwcObservedQuarterByCDPO(): void {
    this.isLoadingForDPOActive = true;
    this.service
      .awcObservedQuarterByCDPO(  // Fixed: was calling CDPOActive instead
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForCDPOTrends = false;

          const formattedData = res?.data?.formattedData || [];

          const labels = formattedData.map((item: any) => item.label);

          const datasets: any[] = [];

          /** 1️⃣ Quarter-wise (always present) */
          datasets.push({
            label: '% Completion (Quarter)',
            data: formattedData.map((item: any) => item.observed_percentage),
            fill: false,
            borderColor: 'green',
            tension: 0.4,
          });

          /** 2️⃣ State-wise (only if at least one value > 0) */
          const hasStateData = formattedData.some(
            (item: any) => item.state_observed_percentage !== null
          );

          if (hasStateData) {
            datasets.push({
              label: '% Completion (State)',
              data: formattedData.map((item: any) =>
                item.state_observed_percentage ?? 0
              ),
              borderColor: 'red',
              fill: false,
              tension: 0.4,
              // borderDash: [5, 5], // optional visual distinction
            });
          }

          /** 3️⃣ District-wise (only if district_id filter applied) */
          const hasDistrictData = formattedData.some(
            (item: any) => item.district_observed_percentage !== null
          );

          if (hasDistrictData) {
            datasets.push({
              label: '% Completion (District)',
              data: formattedData.map((item: any) =>
                item.district_observed_percentage ?? 0
              ),
              borderColor: 'blue',
              fill: false,
              tension: 0.4,
              // borderDash: [10, 5], // optional visual distinction
            });
          }

          /** Final chart object */
          this.cdpoChartData = {
            labels,
            datasets
          };
        }
      });
  }

  getAwcObservedQuarterByDPO(): void {
    this.isLoadingForDPOActive = true;
    this.service
      .awcObservedQuarterByDPO(  // Fixed: was calling CDPOActive instead
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          // Sort quarters in correct order
          
          const formattedData = res?.data?.formattedData || [];

          const labels = formattedData.map((item: any) => item.label);

          const datasets: any[] = [];

          /** 1️⃣ Quarter-wise (always present) */
          datasets.push({
            label: '% Completion (Quarter)',
            data: formattedData.map((item: any) => item.observed_percentage),
            fill: false,
            borderColor: 'green',
            tension: 0.4,
          });

          /** 2️⃣ State-wise (only if at least one value > 0) */
          const hasStateData = formattedData.some(
            (item: any) => item.state_observed_percentage !== null
          );

          if (hasStateData) {
            datasets.push({
              label: '% Completion (State)',
              data: formattedData.map((item: any) =>
                item.state_observed_percentage ?? 0
              ),
              fill: false,
              tension: 0.4,
              borderColor: 'red',
              // borderDash: [5, 5], // optional visual distinction
            });
          }

          /** 3️⃣ District-wise (only if district_id filter applied) */
          const hasDistrictData = formattedData.some(
            (item: any) => item.district_observed_percentage !== null
          );

          if (hasDistrictData) {
            datasets.push({
              label: '% Completion (District)',
              data: formattedData.map((item: any) =>
                item.district_observed_percentage ?? 0
              ),
              fill: false,
              tension: 0.4,
              borderColor: 'blue',
              // borderDash: [10, 5], // optional visual distinction
            });
          }

          /** Final chart object */
          this.dpoChartData = {
            labels,
            datasets
          };
        },
        error: (err) => {
          this.isLoadingForDPOActive = false;
          console.error("Error fetching DPOActiveData:", err);
        },
      });
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
          // backgroundColor: '#5D87FF',
          // hoverBackgroundColor: '#4a6cd8',
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


  toggleView(): void {
    this.showChart = !this.showChart;
  }

  getUnvisistedAwcForSupervisor(): void {

    this.service
      .unVisitedAwcCountSupervisor(  // Fixed: was calling CDPOActive instead
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          // Sort quarters in correct order
          const formattedData = res?.data?.formattedData || [];

          const labels = formattedData.map((item: any) => item.month_name);

          const datasets: any[] = [];

          datasets.push({
            label: 'AWC#',
            data: formattedData.map((item: any) => item.unvisited_percentage),
            backgroundColor: "#5D87FF",
            barThickness: 40,
            hoverBackgroundColor: "#4a6cd8",
            // fill: false,
            // borderColor: '',
            // tension: 0.4,

          });


          /** Final chart object */
          this.barChartUnVisitedAwcCountSupervisor = {
            labels,
            datasets
          };
        },
        error: (err) => {

          console.error("Error fetching DPOActiveData:", err);
        },
      });
  }

  loadTableAndChartData(): void {
    this.isLoading = true;


    this.tableData = [];

    let apiCall$;

    switch (this.selectedRole) {

      case 'DPO':



        if (this.selectedDistrict && !this.selectedBlock) {
          this.headerConfig.title = `Block wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'Block  Name', clickable: true, totalLabel: true },
              { key: 'sectors_available', label: 'Sectors Available', align: 'left', total: true },
              { key: 'sectors_observed', label: 'sectors Observed', align: 'left', total: true },
              { key: 'sectors_not_observed', label: 'sectors Not Observed', align: 'left', total: true },
              {
                key: 'sector_completion_percentage',
                label: 'Completion Percentage % for this quarter',
                suffix: '%',
                percentage: true,
                numeratorKey: 'sectors_observed',
                denominatorKey: 'sectors_available',
                decimals: 2
              }
            ]
          };


        } else if (this.selectedDistrict && this.selectedBlock) {
          this.headerConfig.title = `District wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            showFooter: true,
            enableSearch: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'Block Name', clickable: true, totalLabel: true },
              { key: 'sectors_available', label: 'Sectors Available', align: 'left', total: true },
              { key: 'sectors_observed', label: 'sectors Observed', align: 'left', total: true },
              { key: 'sectors_not_observed', label: 'sectors Not Observed', align: 'left', total: true },
              {
                key: 'sector_completion_percentage',
                label: 'Completion Percentage % for this quarter',
                suffix: '%',
                percentage: true,
                numeratorKey: 'sectors_observed',
                denominatorKey: 'sectors_available',
                decimals: 2
              }
            ]
          };
        } else {
          this.headerConfig.title = `District wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'District Name', clickable: true, totalLabel: true },
              { key: 'sectors_available', label: 'Sectors Available', align: 'left', total: true },
              { key: 'sectors_observed', label: 'sectors Observed', align: 'left', total: true },
              { key: 'sectors_not_observed', label: 'sectors Not Observed', align: 'left', total: true },
              {
                key: 'sector_completion_percentage',
                label: 'Completion Percentage % for this quarter',
                suffix: '%',
                percentage: true,
                numeratorKey: 'sectors_observed',
                denominatorKey: 'sectors_available',
                decimals: 2
              }
            ]
          };
        }
        this.chartConfig = {
          enabled: true,
          enableSort: true,
          labelColumnKey: 'name',
          dataColumnKey: 'sector_completion_percentage',
          chartLabel: 'Sector Completion %',
          // backgroundColor: '#cfe3ff',
          chartFileName: 'dpo-observation.png',
          options: {
            scales: {
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: '% completion'
                }
              }
            }
          }
        };
        apiCall$ = this.service.getObservationCompletionForDPO(
          this.selectedYear.toString(),
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector
        );

        break;

      case 'CDPO':

        if (this.selectedDistrict && !this.selectedBlock) {
          this.headerConfig.title = `Block wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'Block Name', clickable: true, totalLabel: true },
              { key: 'centers_available', label: 'Centers Available', align: 'left', total: true },
              { key: 'centers_observed_this_month', label: 'Centers Observed This Month', align: 'left', total: true },
              { key: 'centers_observed_this_quarter', label: 'Centers Observed This Quarter', align: 'left', total: true },
              { key: 'centers_not_observed_this_quarter', label: 'Centers Not Observed This Quarter', align: 'left', total: true },
              {
                key: 'completion_percentage_this_quarter',
                label: 'Completion Percentage % for this quarter',
                align: 'left', suffix: '%',
                percentage: true,
                numeratorKey: 'centers_observed_this_quarter',
                denominatorKey: 'centers_available',
                decimals: 2,
                comparison: {
                  enabled: true,
                  statusKey: 'comparison'
                }
              }
            ]
          };
        } else if (this.selectedDistrict && this.selectedBlock) {
          this.headerConfig.title = `Sector wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'Sector Name', clickable: true, totalLabel: true },
              { key: 'centers_available', label: 'Centers Available', align: 'left', total: true },
              { key: 'centers_observed_this_month', label: 'Centers Observed This Month', align: 'left', total: true },
              { key: 'centers_observed_this_quarter', label: 'Centers Observed This Quarter', align: 'left', total: true },
              { key: 'centers_not_observed_this_quarter', label: 'Centers Not Observed This Quarter', align: 'left', total: true },
              {
                key: 'completion_percentage_this_quarter',
                label: 'Completion Percentage % for this quarter',
                align: 'left', suffix: '%',
                percentage: true,
                numeratorKey: 'centers_observed_this_quarter',
                denominatorKey: 'centers_available',
                decimals: 2,
                comparison: {
                  enabled: true,
                  statusKey: 'comparison'
                }
              }

            ]
          };
        } else {
          this.headerConfig.title = `District wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'District Name', clickable: true, totalLabel: true },
              { key: 'centers_available', label: 'Centers Available', align: 'left', total: true },
              { key: 'centers_observed_this_month', label: 'Centers Observed This Month', align: 'left', total: true },
              { key: 'centers_observed_this_quarter', label: 'Centers Observed This Quarter', align: 'left', total: true },
              { key: 'centers_not_observed_this_quarter', label: 'Centers Not Observed This Quarter', align: 'left', total: true },
              {
                key: 'completion_percentage_this_quarter',
                label: 'Completion Percentage % for this quarter',
                align: 'left', suffix: '%',
                percentage: true,
                numeratorKey: 'centers_observed_this_quarter',
                denominatorKey: 'centers_available',
                decimals: 2,
                comparison: {
                  enabled: true,
                  statusKey: 'comparison'
                }
              }
            ]
          };
        }

        this.chartConfig = {
          enabled: true,
          enableSort: true,
          labelColumnKey: 'name',
          dataColumnKey: 'completion_percentage_this_quarter',
          chartLabel: 'Quarter Completion %',
          // backgroundColor: 'rgb(255, 214, 214)',
          chartFileName: 'cdpo-observation.png',
          options: {
            scales: {
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: '% completion'
                }
              }
            }
          }
        };

        apiCall$ = this.service.getObservationCompletionForCDPO(
          this.selectedYear.toString(),
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector
        );
        break;

      case 'Block Supervisor':
        if (this.selectedDistrict && !this.selectedBlock) {
          this.headerConfig.title = `Blockwise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'Block Name', clickable: true, totalLabel: true },
              { key: 'centers_available', label: 'Centers Available', align: 'left', total: true },
              { key: 'current_month_centers_observed', label: 'Centers Observed', align: 'left', total: true },
              { key: 'current_month_centers_not_observed', label: 'Centers Not Observed', align: 'left', total: true },
              {
                key: 'current_month_observed_percentage',
                label: 'Completion Percentage % for this month',
                align: 'left',
                suffix: '%',
                percentage: true,
                numeratorKey: 'current_month_centers_observed',
                denominatorKey: 'centers_available',
                decimals: 2,
                comparison: {
                  enabled: true,
                  statusKey: 'comparison'
                }
              }
            ]
          };
        } else if (this.selectedDistrict && this.selectedBlock) {
          this.headerConfig.title = `Sector wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'Sector Name', clickable: true, totalLabel: true },
              { key: 'centers_available', label: 'Centers Available', align: 'left', total: true },
              { key: 'current_month_centers_observed', label: 'Centers Observed', align: 'left', total: true },
              { key: 'current_month_centers_not_observed', label: 'Centers Not Observed', align: 'left', total: true },
              {
                key: 'current_month_observed_percentage',
                label: 'Completion Percentage % for this month',
                align: 'left',
                suffix: '%',
                percentage: true,
                numeratorKey: 'current_month_centers_observed',
                denominatorKey: 'centers_available',
                decimals: 2,
                comparison: {
                  enabled: true,
                  statusKey: 'comparison'
                }
              }
            ]
          };
        } else {
          this.headerConfig.title = `District wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`
          this.tableConfig = {
            enableSearch: true,
            showFooter: true,
            columns: [
              { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
              { key: 'name', label: 'District Name', clickable: true, totalLabel: true },
              { key: 'centers_available', label: 'Centers Available', align: 'left', total: true },
              { key: 'current_month_centers_observed', label: 'Centers Observed', align: 'left', total: true },
              { key: 'current_month_centers_not_observed', label: 'Centers Not Observed', align: 'left', total: true },
              {
                key: 'current_month_observed_percentage',
                label: 'Completion Percentage % for this month',
                align: 'left',
                suffix: '%',
                percentage: true,
                numeratorKey: 'current_month_centers_observed',
                denominatorKey: 'centers_available',
                decimals: 2,
                comparison: {
                  enabled: true,
                  statusKey: 'comparison'
                }
              }
            ]
          };
        }

        this.chartConfig = {
          enabled: true,
          enableSort: true,
          labelColumnKey: 'name',
          dataColumnKey: 'current_month_observed_percentage',
          chartLabel: 'Month Completion %',
          // backgroundColor: 'rgb(202, 245, 247)',
          chartFileName: 'supervisor-observation.png',
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: '% completion'
                }
              }
            }
          }
        };

        apiCall$ = this.service.getObservationCompletionForSupervisor(
          this.selectedYear.toString(),
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector
        );
        break;
    }

    console.log(this.tableConfig, "tableConfig loadTableAndChartData");

    // 🚨 CRITICAL: Only make API call if we have a valid observable
    if (!apiCall$) {
      this.isLoading = false;
      return;
    }

    apiCall$.subscribe({
      next: (res) => {
        console.log(res, "dashanoard res");

        const data = res?.data?.data ?? [];

        // 🚨 Set tableData AFTER receiving response
        this.tableData = data;

        // this.createDistrictBarChart(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.tableData = []; // Clear on error too
      }
    });
  }

  setConfigurationForTable(): void {

  }

  onToggleChangeUserChange(role: any): void {
    if (this.selectedRole === role) return;

    // Step 1: Set loading state immediately
    this.isLoading = true;

    // Step 2: Clear existing config with a valid empty structure
    this.tableConfig = {
      enableSearch: false,
      showFooter: false,
      columns: []
    };

    // Step 3: Clear table data
    this.tableData = [];

    // Step 4: Update role
    this.selectedRole = role;

    // Step 5: Use setTimeout to ensure Angular processes the clearing first
    setTimeout(() => {
      this.loadTableAndChartData();
    }, 0);
  }
  onRowClick(row: any): void {
    console.log(row, "row data");

    const year = this.selectedYear;
    const month = this.selectedMonth;
    let apiCall$;
    switch (this.selectedRole) {
      case 'DPO':
        if (this.selectedDistrict && !this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelDPO(
              undefined,
              year,
              month,
              row.group_id,
            )
        } else if (this.selectedDistrict && this.selectedBlock) {

        } else {
          apiCall$ = this.service
            .getObsCompletetionExcelDPO(
              row.group_id,
              year,
              month,
              undefined,
            )
        }
        break;

      case 'CDPO':
        if (this.selectedDistrict && !this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelCDPO(
              undefined,
              year,
              month,
              row.group_id,
            )
        } else if (this.selectedDistrict && this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelCDPO(
              undefined,
              year,
              month,
              undefined,
              row.group_id,
            )
        } else {
          apiCall$ = this.service
            .getObsCompletetionExcelCDPO(
              row.group_id,
              year,
              month,
              undefined,
            )
        }
        break;

      case 'Block Supervisor':
        if (this.selectedDistrict && !this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelSupervisor(
              undefined,
              year,
              month,
              row.group_id,
            )
        } else if (this.selectedDistrict && this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelSupervisor(
              undefined,
              year,
              month,
              undefined,
              row.group_id,
            )
        } else {
          apiCall$ = this.service
            .getObsCompletetionExcelSupervisor(
              row.group_id,
              year,
              month,
              undefined,
            )
        }

        break;
    }

    apiCall$?.subscribe({
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


    console.log("block is working");



  }

  onDistrictChange(val): void {
    console.log("District changed to:", val);
    this.blockData = [];
    this.sectorData = [];
    this.selectedBlock = "";
    this.selectedSector = "";

    if (this.selectedDistrict || this.selectedDistrict === "") {
      this.loadBlockData(this.selectedDistrict);
      const districtName = this.districtData.find(
        (district) => district.district_id == this.selectedDistrict
      );
      console.log(districtName, "districtName");
    }

    // 🚨 Clear table config and data before reload
    this.tableConfig = {
      enableSearch: false,
      showFooter: true,
      columns: []
    };
    this.tableData = [];

    // Use setTimeout to ensure filter values are properly set
    setTimeout(() => {
      this.loadAllDashboardData();
    }, 0);
  }

  onBlockChange(): void {
    console.log("Block changed to:", this.selectedBlock);
    this.sectorData = [];
    this.selectedSector = "";

    if (this.selectedBlock) {
      this.loadSectorData(this.selectedBlock);
      const blockName = this.blockData.find(
        (block) => block.block_id == this.selectedBlock
      );
    }

    // 🚨 Clear table config and data before reload
    this.tableConfig = {
      enableSearch: false,
      showFooter: true,
      columns: []
    };
    this.tableData = [];

    // Use setTimeout to ensure filter values are properly set
    setTimeout(() => {
      this.loadAllDashboardData();
    }, 0);
  }

  onSectorChange(): void {
    // 🚨 Clear table config and data before reload
    this.tableConfig = {
      enableSearch: false,
      showFooter: true,
      columns: []
    };
    this.tableData = [];

    // Use setTimeout to ensure filter values are properly set
    setTimeout(() => {
      this.loadAllDashboardData();
    }, 0);
  }

  onFilterChange(): void {
    console.log(
      "Filter changed - Year:", this.selectedYear,
      "Month:", this.selectedMonth
    );

    // Reload all dashboard data with new filters
    this.loadAllDashboardData();
  }

  clearFilters(): void {
    const filtersApplied = this.selectedDistrict || this.selectedBlock || this.selectedSector;
    if (this.isStateUser) {
      this.selectedDistrict = "";
      this.selectedBlock = "";
    }
    if (this.role == this.isBlockUser) {

    }
    if (this.isDistrictUser) {
      this.selectedBlock = "";
    }
    this.tableConfig = {
      enableSearch: false,
      showFooter: true,
      columns: []
    };

    // Step 3: Clear table data
    this.tableData = [];
    if (filtersApplied) {
      this.blockData = [];
      this.sectorData = [];

      // Reload all dashboard data at state level
      setTimeout(() => {
        this.loadAllDashboardData();
      }, 0);
    }
  }

  loadBlockData(districtId): void {
    this.isLoading = true;
    const filter: any = {

    }
    if (this.isDistrictUser || this.isBlockUser) {
      filter.district_id = this.user.district_id
      if (this.isBlockUser) {
        filter.block_id = this.user.block_id
      }
    }
    if (districtId) {
      filter.district_id = districtId
    }

    this.service.postBlockDataWithFilter(filter).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res, "Block Data");
        this.blockData = res?.data?.result || [];
        this.blockData = this.blockData.sort((a: any, b: any) =>
          a.block_name?.localeCompare(b.block_name)
        );
        if (this.isBlockUser) {
          this.selectedDistrict = this.districtData[0].district_id;
          this.selectedBlock = this.blockData[0].block_id;
          this.loadAllDashboardData();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Block API Error:", err);
      },
    });
  }

  loadSectorData(blockId): void {
    console.log(blockId, "block Id checking");
    this.isLoading = true;
    this.service.postSectorData(blockId).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res?.data?.result, "Sector Data");
        this.sectorData = res?.data?.result || [];
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Sector API Error:", err);
      },
    });
  }
}
