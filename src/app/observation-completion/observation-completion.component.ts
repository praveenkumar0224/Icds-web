import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DashboardServiceService } from "../shared/services/dashboard-service.service";
import { Router } from "@angular/router";
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatSort } from '@angular/material/sort';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-observation-completion',
  templateUrl: './observation-completion.component.html',
  styleUrls: ['./observation-completion.component.scss']
})

export class ObservationCompletionComponent implements OnInit {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart1') lineChartChart1Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart2') lineChartChart2Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartChart3') lineChartChart3Ref!: ElementRef<HTMLCanvasElement>;

  @ViewChild(MatSort) sort!: MatSort;

  showChart = true;
  headerTitile: string = "ICDS - Observation completion";
  isLoading = false;
  stateLevelData: any;
  districtData: any[] = [];
  blockData: any[] = [];
  sectorData: any[] = [];

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
  currentYear: string = new Date().getFullYear().toString();
  currentMonth: number = new Date().getMonth() + 1;

  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  selectedDistrict = "";
  selectedBlock = "";
  selectedSector = "";



  selectedRole: any = 'DPO'; // default
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


  displayedColumns: string[] = ['slNo', 'district', 'available', 'observed', 'observePercentage'];
  dataSource = new MatTableDataSource<any>([]);
  labelChanges = {
    stateObserveBox: "Awc's Observed across the State",
    stateProgressBox: "Awc's progress this month",
    stateNotObserveBox: "Awc's not Observed this month",
    stateTotalBox: "Total AWCs",
    stateActiveUserBox: "Active users this month",
    stateObservTrendsChart: "AWC observation trends",
    stateObservNotTrendsChart: "AWCs not visited trends ",
    stateActiveUserChart: "Active User trends",
    barchart: `District wise Observation Completion (${this.monthNames[parseInt(this.selectedMonth) - 1]})`,
    sectionType: "District"
  }

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

  constructor(
    private service: DashboardServiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.findingYear();
    this.loadDistrictData();
    this.loadAllDashboardData();
  }

  findingYear(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    for (let y = startYear; y <= currentYear + 1; y++) {
      this.years.push(y);
    }
    this.selectedYear = currentYear;
  }

  loadDistrictData(): void {
    this.isLoading = true;
    this.service.postDistrictData().subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res, "District Data");
        this.districtData = res?.data?.result || [];
        // Sort districts alphabetically if needed
        this.districtData = this.districtData.sort((a: any, b: any) =>
          a.district_name?.localeCompare(b.district_name)
        );
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
    this.callSupervisorObservationCompletion();
    this.callCDPOObservationCompletion();
    this.callSupervisorActive();
    this.callCDPOActive();
    this.callDPOActive();
    this.getAwcObservedBySupervisor();
    this.getAwcObservedQuarterByCDPO();
    this.getAwcObservedQuarterByDPO();
    this.getSectorsObservedByDPO();
    this.loadTableAndChartData()
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
          this.supervisorObservationCompletionData = res?.data ?? 0;
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
    this.service
      .supervisorActive(  // Fixed: was calling CDPOObs instead
        this.selectedDistrict,
        this.selectedYear.toString(),
        this.selectedMonth,
        this.selectedBlock,
        this.selectedSector,
      )
      .subscribe({
        next: (res) => {
          this.isLoadingForSupervisorActive = false;
          this.supervisorActiveData = res?.data ?? {
            presentMonthActiveRate: 0,
            lastMonthActiveRate: 0
          };
        },
        error: (err) => {
          this.isLoadingForSupervisorActive = false;
          console.error("Error fetching supervisorActiveData:", err);
        },
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

          // 👉 Chart labels (Nov-2025, Dec-2025, Jan-2026)
          const labels = data.map((item: any) => item.year_month);
          console.log(data, "data");

          console.log();


          // 👉 Percentage values
          const percentages = data.map((item: any) =>
            Number(item.observed_percentage ?? 0)
          );
          console.log(percentages);

          this.supervisorChartData = {
            labels,
            datasets: [
              {
                data: percentages,
                label: 'Supervisor AWC Observation %',
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 5
              }
            ]
          };
        },
        error: (err) => {
          this.isLoadingForSupervisorTrends = false;
          console.error('Error fetching Supervisor Trends:', err);
        }
      });
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

          // Sort quarters in correct order
          // const quarterOrder = ['Q1','Q2', 'Q3', 'Q4'];
          const quarterOrder = ['Q4', 'Q3', 'Q2', 'Q1'];

          const sortedData = formattedData.sort(
            (a: any, b: any) =>
              quarterOrder.indexOf(a.quarter) - quarterOrder.indexOf(b.quarter)
          );
          console.log(sortedData);

          this.cdpoChartData = {
            labels: sortedData.map((item: any) => item.label),
            datasets: [
              {
                data: sortedData.map((item: any) => item.observed_percentage),
                label: '% Completion',
                fill: false,
                tension: 0.4
              }
            ]
          };


        },
        error: (err) => {
          this.isLoadingForDPOActive = false;
          console.error("Error fetching DPOActiveData:", err);
        },
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
          const quarterOrder = ['Q4', 'Q3', 'Q2', 'Q1'];
          const formattedData = res?.data?.formattedData || [];
          const sortedData = formattedData.sort(
            (a: any, b: any) =>
              quarterOrder.indexOf(a.quarter) - quarterOrder.indexOf(b.quarter)
          );

          this.dpoChartData = {
            labels: sortedData.map((item: any) => item.label),
            datasets: [
              {
                data: sortedData.map((item: any) => item.observed_percentage),
                label: '% Completion',
                fill: false,
                tension: 0.4
              }
            ]
          };

        },
        error: (err) => {
          this.isLoadingForDPOActive = false;
          console.error("Error fetching DPOActiveData:", err);
        },
      });
  }



  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
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

  private setupTableSorting(): void {
    if (this.sort && this.dataSource) {
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
        switch (sortHeaderId) {
          case 'district':
            return (data.district || '').toLowerCase();
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

  private createDistrictBarChart(data: any[]): void {
    if (!data || data.length === 0) return;

    this.barChartData = {
      labels: data.map(item => item.name.toUpperCase()),
      datasets: [
        {
          data: data.map(item => Number(item.current_observed_percentage)),
          label: 'Centers Observed Percentage',
          backgroundColor: '#5D87FF',
          hoverBackgroundColor: '#4a6cd8',
          borderRadius: 6,
          barThickness: 30
        }
      ]
    };

    this.getTableData(data);
  }
  toggleView(): void {
    this.showChart = !this.showChart;
  }

  getTableData(apiData: any[]) {
    if (!apiData || apiData.length === 0) return;

    const formatted = apiData.map((item, index) => {
      const observed = Number(item.current_month_centers_observed);
      const available = Number(item.centers_available);

      return {
        slNo: index + 1,
        id: item.group_id,
        district: item.name,
        available,
        observed: item.current_centers_observed,
        // centerNotObserved: available - observed,
        observePercentage: item.current_observed_percentage
      };
    });
    console.log(formatted, "formatted");

    this.dataSource.data = formatted;

    setTimeout(() => {
      this.setupTableSorting();
    }, 0);
  }
  loadTableAndChartData(): void {
    this.isLoading = true;
    this.showChart = true;

    let apiCall$;

    switch (this.selectedRole) {
      case 'DPO':
        apiCall$ = this.service.getObservationCompletionForDPO(
          this.selectedYear.toString(),
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector
        );
        break;

      case 'CDPO':
        apiCall$ = this.service.getObservationCompletionForCDPO(
          this.selectedYear.toString(),
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector
        );
        break;

      case 'SUPERVISOR':
        apiCall$ = this.service.getObservationCompletionForSupervisor(
          this.selectedYear.toString(),
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector
        );
        break;
    }

    apiCall$?.subscribe({
      next: (res) => {
        const data = res?.data?.data ?? [];

        if (data.length > 0) {
          this.createDistrictBarChart(data);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Observation Completion API Error:', err);
        this.isLoading = false;
      }
    });
  }



  onToggleChangeUserChange(role: any): void {
    if (this.selectedRole === role) return;

    this.selectedRole = role;

    // Reset drilldowns if needed
    this.selectedDistrict = null;
    this.selectedBlock = null;
    this.selectedSector = null;

    this.loadTableAndChartData();
  }
  onDistrictOrBlockClick(row: any): void {
    console.log(row, "row data");

    const year = this.selectedYear;
    const month = this.selectedMonth;
    let apiCall$;
    switch (this.selectedRole) {
      case 'DPO':
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
          apiCall$ = this.service
            .getObsCompletetionExcelCDPO(
              undefined,
              year,
              month,
              row,
            )
        } else if (this.selectedDistrict && this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelCDPO(
              undefined,
              year,
              month,
              undefined,
              row
            )
        } else {
          apiCall$ = this.service
            .getObsCompletetionExcelCDPO(
              row,
              year,
              month,
              undefined,
            )
        }
        break;

      case 'SUPERVISOR':
        if (this.selectedDistrict && !this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelSupervisor(
              undefined,
              year,
              month,
              row,
            )
        } else if (this.selectedDistrict && this.selectedBlock) {
          apiCall$ = this.service
            .getObsCompletetionExcelSupervisor(
              undefined,
              year,
              month,
              undefined,
              row
            )
        } else {
          apiCall$ = this.service
            .getObsCompletetionExcelSupervisor(
              row,
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

    // Reload all dashboard data with new filters
    this.loadAllDashboardData();
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

    // Reload all dashboard data with new filters
    this.loadAllDashboardData();
  }

  onSectorChange(): void {
    // Reload all dashboard data with new filters
    this.loadAllDashboardData();
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

    this.selectedDistrict = "";
    this.selectedBlock = "";
    this.selectedSector = "";

    if (filtersApplied) {
      this.blockData = [];
      this.sectorData = [];

      // Reload all dashboard data at state level
      this.loadAllDashboardData();
    }
  }

  loadBlockData(districtId): void {
    this.isLoading = true;
    this.service.postBlockData(districtId).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res, "Block Data");
        this.blockData = res?.data?.result || [];
        this.blockData = this.blockData.sort((a: any, b: any) =>
          a.block_name?.localeCompare(b.block_name)
        );
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
