import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Chart, ChartConfiguration, ChartData, ChartEvent } from "chart.js";
import { DashboardServiceService } from "../shared/services/dashboard-service.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { forkJoin } from "rxjs";
import { TableConfig } from "../common/dynamic-table-chart/dynamic-table-chart.model";

@Component({
  selector: "app-growth-monitoring",
  templateUrl: "./growth-monitoring.component.html",
  styleUrls: ["./growth-monitoring.component.scss"],
})
export class GrowthMonitoringComponent implements OnInit {
  @ViewChild("barChart") barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild("lineChartChart1")
  lineChartChart1Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild("lineChartChart2")
  lineChartChart2Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild("lineChartChart3")
  lineChartChart3Ref!: ElementRef<HTMLCanvasElement>;

  years: number[] = [];
  currentYear = new Date().getFullYear();
  headerTitile: string = "ICDS - Growth Monitoring (State)";
  lineChartLabels: string[] = [];


  localUser = localStorage.getItem('user');
  user = JSON.parse(this.localUser)
  role = this.user?.role?.role_name


  isAccess = true;
  isStateUser = false;
  isDistrictUser = false;
  isBlockUser = false;



  users: string[] = ["Block Supervisor", "DPO", "CDPO"];
  selectedUser: string = "Block Supervisor"; // ✅ Default value


  lineChart = "line";
  selectedTabIndex = 0;
  retryCount = 0;
  maxRetries = 20;
  labelChanges = {
    stateChildDeviation: "No.of children with deviation",
    statePercentageChildDeviation: "% of children with deviation",
    stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
    stateBySupervisorNoDeviationThisMonth:
      "% reporting no deviations this month",
    stateBySupervisor100DeviationThisMonth:
      "% reporting 100% deviations this month",
    stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
    stateSupervisorDeviationTrendsChart:
      "% of supervisors reporting 100% deviation",
    stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
    barchart: "District wise % of AWC's with deviation",
    sectionType: "District",
  };
  awwSupervisorMatrix: any
  byAwc: any
  bySupervisor: any
  bySupervisorTrend: any
  barChartAWCDeviationLabels: string[] = [];

  barChartAWCDeviation: ChartData<"bar"> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: "Centers Observed",
        backgroundColor: "#5D87FF",
        hoverBackgroundColor: "#4a6cd8",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  barChartSupervisorDeviationLabels: string[] = [];

  barChartSupervisorDeviation: ChartData<"bar"> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: "Centers Observed",
        backgroundColor: "#5D87FF",
        hoverBackgroundColor: "#4a6cd8",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  barChartAgegroupDeviationLabels: string[] = [];

  barChartAgegroupDeviation: ChartData<"bar"> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: "Centers Observed",
        backgroundColor: "#5D87FF",
        hoverBackgroundColor: "#4a6cd8",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  barChartLabels: string[] = [];

  barChartData: ChartData<"bar"> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: "Centers Observed",
        backgroundColor: "#5D87FF",
        hoverBackgroundColor: "#4a6cd8",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  // Table data
  displayedColumns: string[] = [
    "slNo",
    "district",
    "totalChildrenPresent",
    "childrenNoDeviation",
    "childrenDeviationCount",
    "deviationPercentage",
  ];
  dataSource = new MatTableDataSource<any>([]);

  sortDirection: "asc" | "desc" = "asc";

  // Chart ViewChild references
  @ViewChild("observationTrendChart", { static: false })
  observationTrendCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild("notVisitedTrendChart")
  notVisitedTrendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild("districtBarChart")
  districtBarCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild(MatSort) sort!: MatSort;

  showChart = true;
  isLoading = false;
  isLoadingObservation = false;
  isLoadingAwc = false;
  isLoadingSupervisor = false;
  isLoadingTrendSupervisor = false;
  isLoadingAgeGroup = false;
  isLoadingHierarchical = false;
  isLoadingAwwSupervisor = false;

  // Data properties
  stateLevelData: any;
  districtData: any[] = [];
  blockData: any[] = [];
  sectorData: any[] = [];

  headerConfig = {
    title: 'Sector wise % of AWC’s with deviation',
    sectionType: 'Sector',
    showExcelDownload: true,
    showChartDownload: true
  };

  tableConfig: TableConfig = {
    enableSearch: true,
    columns: [

    ]
  };
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
  tableData: any[] = [];

  // Filter properties
  // selectedYear = '2025';
  // selectedMonth = '8';
  selectedYear: any
  selectedMonth: string = (new Date().getMonth() + 1).toString();
  // currentYear: string = new Date().getFullYear().toString();
  currentMonth: number = new Date().getMonth() + 1;

  monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  selectedDistrict = "a1f99804-065e-43b0-af24-559470a10327";
  selectedBlock = "";
  selectedSector = "";
  selectedDeviationCategory = "both";
  orderBy = "awc";
  isToggleOn = false;
  isToggleOnForSupervisor = false;
  isToggleOnForHierarchical = false;
  isLoadingForHirerarchical = false;

  // Chart instances
  observationTrendChart?: Chart;
  notVisitedTrendChart?: Chart;
  districtBarChart?: Chart;

  // Line chart
  public observationTrendData: ChartData<"line">;
  public notVisitedTrendData: ChartData<"line">;

  lineChartDataVisited = [
    {
      data: [],
      label: "AWC center ",
      legend: "AWC center",
      borderColor: "#0097F9",
      backgroundColor: "rgba(0, 151, 249, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ];

  lineChartDataNotVisited = [
    {
      data: [],
      label: "AWC center",
      borderColor: "#0097F9",
      backgroundColor: "rgba(0, 151, 249, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ];

  lineChartUserVisited = [
    {
      data: [],
      label: "Active User",
      borderColor: "#0097F9",
      backgroundColor: "rgba(0, 151, 249, 0.1)",
      fill: true,
      tension: 0.4,
    },
  ];

  lineChartOptions: ChartConfiguration["options"] = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
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
    this.getAccessForthisComponent()
    this.findingYear();
    this.staticcall();
    // this.loadDashboardData();

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
        this.isAccess = true;
    }


  }

  onUserChange(event: any) {
    this.selectedUser = event.value;
      this.labelChanges.stateSupervisorDeviationTrendsChart = this.getSupervisorChartTitle(); 
    this.loadDashboardData();
  }
  staticcall() {
    this.loadDistrictData();
    // Promizse
    if (this.isStateUser) {
      this.onDistrictChange("a1f99804-065e-43b0-af24-559470a10327")
    }



    this.onBlockChange();
    //this.loadBlockData("0da0da2b-dbd3-48c0-9ab1-ce73e1df8a94")

    //
  }

  private clearAllData(): void {
    // Clear state level data
    this.stateLevelData = null;
    this.isToggleOnForHierarchical = false;
    this.isLoadingForHirerarchical = false;
    this.isToggleOn = false;


    // Clear chart data
    this.lineChartLabels = [];
    this.lineChartDataVisited[0].data = [];
    this.lineChartDataNotVisited = [
      {
        data: [],
        label: "2–4 Years",
        borderColor: "#5D87FF",
        backgroundColor: "rgba(93, 135, 255, 0.2)",
        fill: false,
        tension: 0.3,
      },
      {
        data: [],
        label: "4–6 Years",
        borderColor: "#FF6B6B",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        fill: false,
        tension: 0.3,
      },
    ];
    this.lineChartUserVisited = [
      {
        data: [],
        label: "male",
        borderColor: "#5D87FF",
        backgroundColor: "rgba(93, 135, 255, 0.2)",
        fill: false,
        tension: 0.3,
      },
      {
        data: [],
        label: "female",
        borderColor: "#FF6B6B",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        fill: false,
        tension: 0.3,
      },
    ];

    // Clear bar chart data
    this.barChartLabels = [];
    this.barChartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: "AWC's Attendance",
          backgroundColor: "#5D87FF",
          hoverBackgroundColor: "#4a6cd8",
          borderRadius: 6,
          barThickness: 30,
        },
      ],
    };

    // Clear table data
    this.dataSource.data = [];
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

  loadDashboardData(): void {
    this.clearAllData();

    this.loadObservationData();
    this.loadAwcData();
    this.loadSupervisorData();
    this.loadTrendSupervisorData();
    this.loadAgeGroupData();
    this.loadHierarchicalData();
    this.loadAwwSupervisorData();
  }

  private loadObservationData() {
    this.isLoadingObservation = true;

    this.service.getgmDashboardByobservation(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory,
      this.selectedUser
    ).subscribe({
      next: (res) => {
        this.stateLevelData = this.stateLevelData || [];
        this.stateLevelData[0] = res.data;
        this.isLoadingObservation = false;
      },
      error: () => {
        this.isLoadingObservation = false;
      }
    });
  }

    private loadAwcData() {
        this.isLoadingAwc = true;

        this.service.getgmDashboardByawc(
          this.selectedYear,
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector,
          this.selectedDeviationCategory,
          this.selectedUser
        ).subscribe({
          next: (res) => {
            this.stateLevelData = this.stateLevelData || [];
            this.stateLevelData[1] = res.data;  
            this.byAwc = res.data[2];
            this.createBarChartAWCDevaition(res.data);
            this.isLoadingAwc = false;
          },
          error: () => {
            this.isLoadingAwc = false;
          }
        });
      }
  private loadSupervisorData() {
    this.isLoadingSupervisor = true;

    this.service.getgmBySupervisor(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory,
      this.selectedUser
    ).subscribe({
      next: (res) => {
          this.stateLevelData = this.stateLevelData || [];
      this.stateLevelData[2] = res.data;  // ✅ store for toggle (0% deviation)
      this.bySupervisor = res.data.deviation_supervisor_reporting[2];
      this.createBarChartSupervisorDevaition(res.data);
      this.isLoadingSupervisor = false;
      },
      error: () => {
        this.isLoadingSupervisor = false;
      }
    });
  }
  private loadTrendSupervisorData() {
    this.isLoadingTrendSupervisor = true;

    this.service.getgmTrendsBySupervisor(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory,
      this.selectedUser
    ).subscribe({
      next: (res) => {
          this.stateLevelData = this.stateLevelData || [];
      this.stateLevelData[3] = res.data;  // ✅ store for toggle (100% deviation)
      this.bySupervisorTrend = res?.data?.deviation_supervisor_reporting[2];
      this.createBarChartSupervisorDevaition(res.data);
      this.isLoadingTrendSupervisor = false;
      },
      error: () => {
        this.isLoadingTrendSupervisor = false;
      }
    });
  }

  private loadAgeGroupData() {
    this.isLoadingAgeGroup = true;

    this.service.getgmAgegroupDeviation(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory,
      this.selectedUser
    ).subscribe({
      next: (res) => {
        this.createBarChartAgegroupDevaition(res.data);
        this.isLoadingAgeGroup = false;
      },
      error: () => {
        this.isLoadingAgeGroup = false;
      }
    });
  }

  private loadHierarchicalData() {
    this.isLoadingHierarchical = true;
    this.prepareJson();
    this.service.getgmHierarchicalDeviation(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory,
      this.orderBy,
      this.selectedUser
    ).subscribe({
      next: (res) => {
        this.tableData = res.data.deviation;
      
        this.isLoadingHierarchical = false;
      },
      error: () => {
        this.isLoadingHierarchical = false;
      }
    });
  }

  private getSupervisorChartTitle(): string {
  const cadre = this.selectedUser; // "Block Supervisor", "DPO", "CDPO"
  const isZero = this.isToggleOnForSupervisor;

  if (cadre === 'Block Supervisor') {
    return isZero
      ? '% of Block Supervisors reporting 0% deviation'
      : '% of Block Supervisors reporting 100% deviation';
  } else if (cadre === 'DPO') {
    return isZero
      ? '% of DPOs reporting 0% deviation'
      : '% of DPOs reporting 100% deviation';
  } else if (cadre === 'CDPO') {
    return isZero
      ? '% of CDPOs reporting 0% deviation'
      : '% of CDPOs reporting 100% deviation';
  }

  return isZero
    ? '% of supervisors reporting 0% deviation'
    : '% of supervisors reporting 100% deviation';
}


  private prepareJson() {
    this.tableConfig = {
      enableSearch: false,
      showFooter: true,
      columns: []
    };
    this.tableData = [];

   
    
    if(this.selectedBlock && this.selectedDistrict){
      this.headerConfig.title = `Sector wise % of AWC's with deviation  `
      this.tableConfig = {
        enableSearch: true,
        showFooter: true,
        columns: [
          { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
          { key: 'name', label: 'Sector  Name', clickable: true, totalLabel: true },
          { key: 'total_count', label: 'Total AWC', align: 'left', total: true },
          // { key: 'no_deviation_count', label: 'AWC with no deviation', align: 'left', total: true },
          { key: 'no_deviation_count', label: 'AWC deviation count', align: 'left', total: true },
  
          {
            key: 'percentage',
            label: 'Deviation',
            suffix: '%',
            percentage: true,
            numeratorKey: 'no_deviation_count',
            denominatorKey: 'total_count',
            decimals: 2
          }
        ]
      };
    }else if (this.selectedDistrict && !this.selectedBlock){
      this.headerConfig.title = `District wise % of AWC's with deviation  `
      this.tableConfig = {
        enableSearch: true,
        showFooter: true,
        columns: [
          { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
          { key: 'name', label: 'Block  Name', clickable: true, totalLabel: true },
          { key: 'total_count', label: 'Total AWC', align: 'left', total: true },
          // { key: 'no_deviation_count', label: 'AWC with no deviation', align: 'left', total: true },
          { key: 'no_deviation_count', label: 'AWC deviation count', align: 'left', total: true },
  
          {
            key: 'percentage',
            label: 'Deviation',
            suffix: '%',
            percentage: true,
            numeratorKey: 'no_deviation_count',
            denominatorKey: 'total_count',
            decimals: 2
          }
        ]
      };
    }
  

    this.chartConfig = {
      enabled: true,
      enableSort: true,
      labelColumnKey: 'name',
      dataColumnKey: 'percentage',
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
  }

  private loadAwwSupervisorData() {
    this.isLoadingAwwSupervisor = true;

    this.service.getDeviationByAwwSuperviosr(
      this.selectedYear,
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedDeviationCategory,
      this.selectedUser
    ).subscribe({
      next: (res) => {

        if (res?.data) {
          this.mapAwwSupervisorData(res.data);
        }

        this.isLoadingAwwSupervisor = false;
      },
      error: () => {
        this.isLoadingAwwSupervisor = false;
      }
    });
  }

  private mapAwwSupervisorData(data: any[]) {

    // Reset default
    this.awwSupervisorMatrix = {
      severe: { severe: "0.00", moderate: "0.00", normal: "0.00" },
      moderate: { severe: "0.00", moderate: "0.00", normal: "0.00" },
      normal: { severe: "0.00", moderate: "0.00", normal: "0.00" }
    };

    data.forEach(item => {
      const supervisor = item.supervisor?.toLowerCase();
      const worker = item.worker?.toLowerCase();

      if (this.awwSupervisorMatrix[supervisor] &&
        this.awwSupervisorMatrix[supervisor][worker] !== undefined) {

        this.awwSupervisorMatrix[supervisor][worker] = item.percent;
      }
    });
  }






  setAttandanceData(lineChatdata: any): void {
    const labels = lineChatdata.map((item) => item.month.toUpperCase());
    const data = lineChatdata.map((item) =>
      item.attendance_percentage.replace("%", "")
    );

    this.lineChartLabels = labels;
    this.lineChartDataVisited[0].data = data;
  }

  setGenderWiseAttendanceTrend(lineChatdata: any): void {
    const labels = lineChatdata.map((item) => item.month.toUpperCase());
    const twoToFourData = lineChatdata.map((item: any) =>
      parseFloat(item.twoTofour)
    );
    const fourToSixData = lineChatdata.map((item: any) =>
      parseFloat(item.fourToSiz)
    );

    this.lineChartLabels = labels;

    this.lineChartDataNotVisited = [
      {
        data: twoToFourData,
        label: "2–4 Years",
        borderColor: "#5D87FF",
        backgroundColor: "rgba(93, 135, 255, 0.2)",
        fill: false,
        tension: 0.3,
      },
      {
        data: fourToSixData,
        label: "4–6 Years",
        borderColor: "#FF6B6B",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        fill: false,
        tension: 0.3,
      },
    ];
  }

  setCategoryWiseAttendanceTrend(lineChatdata: any): void {
    console.log(lineChatdata, "lineChatdata");

    const labels = lineChatdata.map((item) => item.month.toUpperCase());
    const maleAttendanceData = lineChatdata?.map((item: any) =>
      parseFloat(item.male_attendece_percentage)
    );
    const femaleAttendanceData = lineChatdata?.map((item: any) =>
      parseFloat(item.female_attendece_percentage)
    );

    console.log(maleAttendanceData);
    console.log(femaleAttendanceData);

    this.lineChartLabels = labels;
    this.lineChartUserVisited = [
      {
        data: maleAttendanceData,
        label: "male",
        borderColor: "#5D87FF",
        backgroundColor: "rgba(93, 135, 255, 0.2)",
        fill: false,
        tension: 0.3,
      },
      {
        data: femaleAttendanceData,
        label: "female",
        borderColor: "#FF6B6B",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        fill: false,
        tension: 0.3,
      },
    ];
  }

  private createDistrictBarChart(data: any): void {
    console.log("Creating bar chart with data:", data);

    // Safely check if district_wise_deviation exists and has items
    if (
      data &&
      data.deviation &&
      Array.isArray(data.deviation) &&
      data.deviation.length > 0
    ) {
      this.barChartLabels = data.deviation.map((item) =>
        item.name.toUpperCase()
      );

      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [
          {
            data: data.deviation.map((item) =>
              item.percentage
            ),
            backgroundColor: "#5D87FF",
            hoverBackgroundColor: "#4a6cd8",
            borderRadius: 6,
            barThickness: 30,
          },
        ],
      };

      this.getTableData(data);
    } else {
      // Handle empty data case
      console.warn("No district_wise_deviation data available");
      this.barChartLabels = [];
      this.barChartData = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "#5D87FF",
            hoverBackgroundColor: "#4a6cd8",
            borderRadius: 6,
            barThickness: 30,
          },
        ],
      };
      this.dataSource.data = [];
    }
  }


  private createBarChartAWCDevaition(data: any): void {
    console.log("Creating AWC deviation chart with data:", data);

    // Check if data exists AND is an array with items
    if (data && Array.isArray(data) && data.length > 0) {
      this.barChartAWCDeviationLabels = data.map((item) =>
        item?.month.toUpperCase()
      );

      this.barChartAWCDeviation = {
        labels: [...this.barChartAWCDeviationLabels],
        datasets: [
          {
            data: data.map((item) =>
              parseFloat(
                item?.percent_non_zero_diff.toString().replace("%", "")
              )
            ),
            backgroundColor: "#5D87FF",
            hoverBackgroundColor: "#4a6cd8",
            borderRadius: 6,
            barThickness: 30,
          },
        ],
      };

      console.log("Updated barChartAWCDeviation:", this.barChartAWCDeviation);
    } else {
      // Clear chart if no valid data
      console.warn("No valid AWC deviation data available");
      this.barChartAWCDeviation = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "#5D87FF",
            hoverBackgroundColor: "#4a6cd8",
            borderRadius: 6,
            barThickness: 30,
          },
        ],
      };
    }
  }

  private createBarChartSupervisorDevaition(data: any): void {
    console.log("Creating bar chart with data:", data);

    if (data?.deviation_supervisor_reporting?.length > 0) {
      this.barChartSupervisorDeviationLabels =
        data?.deviation_supervisor_reporting?.map((item) =>
          item.month.toUpperCase()
        );

      this.barChartSupervisorDeviation = {
        labels: this.barChartSupervisorDeviationLabels,
        datasets: [
          {
            data: data?.deviation_supervisor_reporting?.map(
              (item) => item?.deviation
            ),
            // label: '% of supervisors reporting 100% deviation',
            backgroundColor: "#5D87FF",
            hoverBackgroundColor: "#4a6cd8",
            borderRadius: 6,
            barThickness: 30,
          },
        ],
      };
    }
  }

  private createBarChartAgegroupDevaition(data: any): void {
    console.log("Creating bar chart with data:", data?.age_wise_deviation);

    if (data?.age_wise_deviation?.length > 0) {
      this.barChartAgegroupDeviationLabels = data?.age_wise_deviation?.map(
        (item) => item.age_group
      );

      this.barChartAgegroupDeviation = {
        labels: this.barChartAgegroupDeviationLabels,
        datasets: [
          {
            data: data?.age_wise_deviation?.map((item) => item?.percentage),
            // label: 'Age group wise deviation %',
            backgroundColor: "#5D87FF",
            hoverBackgroundColor: "#4a6cd8",
            borderRadius: 6,
            barThickness: 30,
          },
        ],
      };

      console.log(this.barChartAgegroupDeviation);
    }
  }

  private setupTableSorting(): void {
    if (!this.sort) {
      this.retryCount++;

      if (this.retryCount > this.maxRetries) {
        console.warn("MatSort still not available. Stopping retries.");
        return;
      }

      console.warn(`MatSort not available yet, retrying... (${this.retryCount})`);
      setTimeout(() => this.setupTableSorting(), 100);
      return;
    }

    // Sorting is ready → reset retry counter
    this.retryCount = 0;

    if (!this.dataSource) {
      console.warn("DataSource not available");
      return;
    }

    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case "district":
          return data.district?.toLowerCase();
        case "slNo":
          return Number(data.slNo);
        case "totalChildrenPresent":
          return Number(data.totalChildrenPresent);
        case "childrenNoDeviation":
          return Number(data.childrenNoDeviation);
        case "childrenDeviationCount":
          return Number(data.childrenDeviationCount);
        case "deviationPercentage":
          return Number(data.deviationPercentage);
        default:
          return data[sortHeaderId];
      }
    };
  }
  getTableData(apiData: any) {
    if (apiData) {
      const formatted = apiData?.deviation.map((item, index) => ({
        slNo: index + 1,
        district: item.name,
        id: item.id,
        totalChildrenPresent: item?.total_count,
        childrenNoDeviation: item?.no_deviation_count,
        childrenDeviationCount: item?.total_count - item?.no_deviation_count,
        deviationPercentage: item?.percentage,
      }));

      this.dataSource.data = formatted;

      // Set up sorting after data is loaded
      setTimeout(() => {
        this.setupTableSorting();
      });
    }
  }

  onRowClick(row: any): void {
    console.log(row, "row data");

    const year = this.selectedYear;
    const month = this.selectedMonth;

    if (this.sectorData.length >= 1) {
      console.log("sector is working");
      this.service
        .GMlineTableExcelDownload(
          undefined,
          year,
          month,
          row,
          undefined,
          this.selectedUser
        )
        .subscribe({
          next: (res: Blob) => {
            const url = window.URL.createObjectURL(res);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Sector_Report_${row.sector_name}_${month}-${year}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => console.error("Sector API error:", err),
        });
    } else if (this.blockData.length >= 1) {
      console.log("block is working");
      this.service
        .GMlineTableExcelDownload(
          undefined,
          year,
          month,
          undefined,
          row,
          this.selectedUser
        )
        .subscribe({
          next: (res: Blob) => {
            const url = window.URL.createObjectURL(res);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Block_Report_${row.block_name}_${month}-${year}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => console.error("Block API error:", err),
        });
    } else if (this.districtData.length >= 1) {
      console.log("district is working");
      this.service
        .GMlineTableExcelDownload(row, year, month, undefined, undefined, this.selectedUser)
        .subscribe({
          next: (res: Blob) => {
            const url = window.URL.createObjectURL(res);
            const a = document.createElement("a");
            a.href = url;
            a.download = `District_Report_${row.district_name}_${month}-${year}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => console.error("District API error:", err),
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
    this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    this.sort.active = "available";
    this.sort.direction = this.sortDirection;
    this.sort.sortChange.emit({
      active: "available",
      direction: this.sortDirection,
    });
  }

  navigateToDetailPage(event: ChartEvent, activeElements: any[]) {
    // Temp Not use
    if (activeElements.length > 0) {
      const index = (activeElements[0] as any).index;
      const label = this.barChartLabels[index];
      const value = this.barChartData.datasets[0].data[index];
      console.log("Clicked Bar:", { label, value });
      // You can now route, filter table, show modal, etc.
    }
  }

  downloadLineChart(): void {
    const canvas = this.lineChartChart1Ref?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn("Bar chart instance not found.");
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL("image/png");

    // 5. Trigger download
    const link = document.createElement("a");
    link.href = image;
    link.download = "AWC observation trends.png";
    link.click();
  }

  downloadline2Chart(): void {
    const canvas = this.lineChartChart2Ref?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn("Bar chart instance not found.");
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL("image/png");

    // 5. Trigger download
    const link = document.createElement("a");
    link.href = image;
    link.download = "AWCs not visited trends.png";
    link.click();
  }

  downloadline3Chart(): void {
    const canvas = this.lineChartChart3Ref?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn("Bar chart instance not found.");
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL("image/png");

    // 5. Trigger download
    const link = document.createElement("a");
    link.href = image;
    link.download = "Active user trends.png";
    link.click();
  }

  downloadBarChart(): void {
    const canvas = this.barChartRef?.nativeElement;
    const chart = Chart.getChart(canvas);

    if (!chart) {
      console.warn("Bar chart instance not found.");
      return;
    }

    // Get canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save chart image as base64 with white background
    // 1. Create temporary canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 2. Fill background with white
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Convert to image
    const image = tempCanvas.toDataURL("image/png");

    // 5. Trigger download
    const link = document.createElement("a");
    link.href = image;
    link.download = "bar-chart.png";
    link.click();
  }

  downloadExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook = {
      Sheets: { "AWC Data": worksheet },
      SheetNames: ["AWC Data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    FileSaver.saveAs(new Blob([excelBuffer]), "awc-observation.xlsx");
  }

  // Master Filter
  loadDistrictData(): void {

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

    this.isLoading = true;
    this.service.postDistrictDatWithFilter(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res, "district Data ");
        this.districtData = res?.data?.result;
        if (this.isDistrictUser || this.isBlockUser) {
          this.selectedDistrict = this.districtData[0].district_id;
          this.loadBlockData(this.selectedDistrict);
        }
        if (this.isDistrictUser) {
          this.loadDashboardData();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Statewise API Error:", err);
      },
    });
  }

  onFilterChange(): void {
    console.log(
      "Filter changed - Year:",
      this.selectedYear,
      "Month:",
      this.selectedMonth
    );

    // Clear current data
    this.clearAllData();

    // Update header title based on current selection
    if (this.selectedSector) {
      this.headerTitile = "ICDS - Growth Monitoring (CDPO)";
    } else if (this.selectedBlock) {
      this.headerTitile = "ICDS - Growth Monitoring (DPO)";
    } else if (this.selectedDistrict) {
      this.headerTitile = "ICDS - Growth Monitoring (DPO)";
    } else {
      this.headerTitile = "ICDS - Growth Monitoring (State)";
    }

    // Load data with current filters
    this.loadDashboardData();
  }

  onToggleChangeForAWCDeviation(value: boolean): void {
    this.isToggleOn = value;
    if (value == true) {
      console.log("samples working");
      
      this.labelChanges.stateAWCDeviationTrendsChart =
        "Month-wise % samples with deviation";
      this.createBarChartAWCDevaition(this.stateLevelData?.[0]);
    } else if (value == false) {
      console.log("AWC working");
      
      this.labelChanges.stateAWCDeviationTrendsChart =
        "Month-wise % AWC's with deviation";
        console.log(this.stateLevelData?.[1], "stateLevelData for AWC deviation");
        
      this.createBarChartAWCDevaition(this.stateLevelData?.[1]);
    }
  }

  onToggleChangeForSupervisorDeviation(value: boolean): void {
    this.isToggleOnForSupervisor = value;
      this.labelChanges.stateSupervisorDeviationTrendsChart = this.getSupervisorChartTitle(); // ✅

    if (value == true) {
      this.labelChanges.stateSupervisorDeviationTrendsChart =
        "% of supervisors reporting 0% deviation";
      this.createBarChartSupervisorDevaition(this.stateLevelData?.[2]);
    } else if (value == false) {
      this.labelChanges.stateSupervisorDeviationTrendsChart =
        "% of supervisors reporting 100% deviation";
        console.log(this.stateLevelData?.[3], "stateLevelData for Supervisor deviation");
        
      this.createBarChartSupervisorDevaition(this.stateLevelData?.[3]);
    }
  }

  onToggleChangeForHierarchicalDeviation(value: boolean): void {
    this.isLoadingForHirerarchical = true
    this.isToggleOnForHierarchical = value;
    if (value === true) {
      if (this.selectedDistrict && !this.selectedBlock) {
        this.labelChanges.barchart = "Block wise % samples with deviation";
      } else if (this.selectedBlock && this.selectedDistrict) {
        this.labelChanges.barchart = "Sector wise % samples with deviation";
      } else {
        this.labelChanges.barchart = "District wise % samples with deviation";
      }

      this.service
        .getgmHierarchicalDeviation(
          this.selectedYear,
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector,
          this.selectedDeviationCategory
        )
        .subscribe({
          next: (response) => {
            console.log("Deviation data (Samples):", response);
            this.createDistrictBarChart(response?.data || []);
            this.isLoadingForHirerarchical = false
          },
          error: (err) => {
            console.error("Error fetching deviation data:", err);
          },
        });
    } else {
      if (this.selectedDistrict && !this.selectedBlock) {
        this.labelChanges.barchart = "Block wise % AWC's with deviation";
      } else if (this.selectedBlock && this.selectedDistrict) {
        this.labelChanges.barchart = "Sector wise % AWC's with deviation";
      } else {
        this.labelChanges.barchart = "District wise % AWC's with deviation";
      }

      this.service
        .getgmHierarchicalDeviation(
          this.selectedYear,
          this.selectedMonth,
          this.selectedDistrict,
          this.selectedBlock,
          this.selectedSector,
          this.selectedDeviationCategory,
          this.orderBy
        )
        .subscribe({
          next: (response) => {
            console.log("Deviation data (AWCs):", response);
            this.createDistrictBarChart(response?.data || []);
            this.isLoadingForHirerarchical = false
          },
          error: (err) => {
            console.error("Error fetching deviation data:", err);
          },
        });
    }
  }

  clearFilters(): void {
    // Check if any filter is currently selected
    const filtersApplied =
      this.selectedDistrict || this.selectedBlock || this.selectedSector;

    if (this.isStateUser) {
      this.selectedDistrict = "";
      this.selectedBlock = "";
    }
    if (this.role == this.isBlockUser) {

    }
    if (this.isDistrictUser) {
      this.selectedBlock = "";
    }

    // Reset labelChanges to default state-level labels
    this.labelChanges = {
      stateChildDeviation: "No.of children with deviation",
      statePercentageChildDeviation: "% of children with deviation",
      stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
      stateBySupervisorNoDeviationThisMonth:
        "% reporting no deviations this month",
      stateBySupervisor100DeviationThisMonth:
        "% reporting 100% deviations this month",
      stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
      stateSupervisorDeviationTrendsChart:
        "% of supervisors reporting 100% deviation",
      stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
      barchart: "District wise % of AWC's with deviation",
      sectionType: "District",
    };

    // Reset header title to state level
    this.headerTitile = "ICDS - Observation Overview (State)";


    if (filtersApplied) {
      // this.districtData = [];
      // this.blockData = [];
      // this.sectorData = [];
      this.loadDashboardData();
    }
  }

  onDistrictChange(val): void {
    console.log("District changed to:", val);

    // Clear dependent data immediately
    this.blockData = [];
    this.sectorData = [];
    this.selectedBlock = ""
    this.selectedSector = "";

    // Clear current dashboard data
    this.clearAllData();

    this.headerTitile = "ICDS - Growth Monitoring (DPO)";

    if (this.selectedDistrict || this.selectedDistrict === "") {
      // Load block data first
      this.loadBlockData(this.selectedDistrict);

      const districtName = this.districtData.find(
        (district) => district.district_id == this.selectedDistrict
      );
      console.log(districtName, "districtName");

      if (this.selectedDistrict) {
        this.labelChanges = {
          stateChildDeviation: "No.of children with deviation",
          statePercentageChildDeviation: "% of children with deviation",
          stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
          stateBySupervisorNoDeviationThisMonth:
            "% reporting no deviations this month",
          stateBySupervisor100DeviationThisMonth:
            "% reporting 100% deviations this month",
          stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
          stateSupervisorDeviationTrendsChart:
            "% of supervisors reporting 100% deviation",
          stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
          barchart: "Block wise % of AWC`s with deviation",
          sectionType: "Block",
        };
      }

      // Load dashboard data with new district
      this.loadDashboardData();
    }
  }

  onBlockChange(): void {
    console.log("Block changed to:", this.selectedBlock);

    // Clear dependent data
    this.sectorData = [];
    this.selectedSector = "";

    // Clear current dashboard data
    this.clearAllData();

    this.headerTitile = "ICDS - Growth Monitoring (DPO)";

    if (this.selectedBlock) {
      // Load sector data first
      this.loadSectorData(this.selectedBlock);

      const blockName = this.blockData.find(
        (block) => block.block_id == this.selectedBlock
      );

      if (this.selectedBlock) {
        this.labelChanges = {
          stateChildDeviation: "No.of children with deviation",
          statePercentageChildDeviation: "% of children with deviation",
          stateByAwcDeviationThisMonth: "% of AWCs with deviation this month",
          stateBySupervisorNoDeviationThisMonth:
            "% reporting no deviations this month",
          stateBySupervisor100DeviationThisMonth:
            "% reporting 100% deviations this month",
          stateAWCDeviationTrendsChart: "Month-wise % AWC's with deviation",
          stateSupervisorDeviationTrendsChart:
            "% of supervisors reporting 100% deviation",
          stateAgeGroupDeviationTrendsChart: "Age group wise deviation %",
          barchart: "Sector wise % of AWC`s with deviation",
          sectionType: "Sector",
        };
      }

      // Load dashboard data with new block
      this.loadDashboardData();
    }
  }

  onDeviationChange(): void {
    console.log("Selected Deviation:", this.selectedDeviationCategory);
    this.loadDashboardData();
  }



  loadBlockData(districtId): void {
    // Load state Api
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
        console.log(res, "Block Data ");
        this.blockData = res?.data?.result;

        this.blockData = res?.data?.result?.sort((a: any, b: any) =>
          a.block_name.localeCompare(b.block_name)
        );
        if (this.isBlockUser) {
          this.selectedDistrict = this.districtData[0].district_id;
          this.selectedBlock = this.blockData[0].block_id;
          this.loadDashboardData();
        }
        // this.loadDashboardData();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Statewise API Error:", err);
      },
    });
  }

  loadSectorData(blockId): void {
    // Load state Api
    console.log(blockId, "black Id checking");

    this.isLoading = true;
    this.service.postSectorData(blockId).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log(res?.data?.result, "Sector Data ");
        this.sectorData = res?.data?.result;
        this.loadDashboardData();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Statewise API Error:", err);
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

  openToast(type: "success" | "error") {
    this.snackBar.open(
      type === "success" ? "Login Successful ✅" : "Something went wrong ❌",
      "Close",
      {
        duration: 3000,
        verticalPosition: "top",
        horizontalPosition: "right",
        panelClass: type === "success" ? ["toast-success"] : ["toast-error"],
      }
    );
  }
}
