import { Component, OnInit } from '@angular/core';
import { DashboardServiceService } from '../shared/services/dashboard-service.service';
import { TableConfig } from '../common/dynamic-table-chart/dynamic-table-chart.model';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  headerTitile = 'ICDS - Attendance Overview (State)';
  labelChanges = {
    stateObserveBox: 'Average attendance this month',
    stateProgressBox: 'Male children',
    stateNotObserveBox: 'Female children',
    stateTotalBox: '2-4 years children',
    stateActiveUserBox: '4-6 years children'
  };
  localUser = localStorage.getItem('user');
  user = this.localUser ? JSON.parse(this.localUser) : null;
  role = this.user?.role?.role_name;


  isAccess = true;
  isStateUser = false;
  isDistrictUser = false;
  isBlockUser = false;

  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonth = (new Date().getMonth() + 1).toString();
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  selectedDistrict = '';
  selectedBlock = '';
  selectedSector = '';
  users: string[] = ['Block Supervisor', 'DPO', 'CDPO'];
  selectedUser = 'Block Supervisor';

  isLoading = false;
  stateLevelData: any;
  districtData: any[] = [];
  blockData: any[] = [];
  sectorData: any[] = [];

  headerConfig = {
    title: 'AWCs Attendance This Month by District',
    sectionType: 'District',
    showExcelDownload: true,
    showChartDownload: true
  };
  tableConfig: TableConfig = {
    enableSearch: true,
    showFooter: true,
    columns: []
  };
  chartConfig = {
    enabled: true,
    enableSort: true,
    labelColumnKey: 'name',
    dataColumnKey: 'attendance_percentage',
    chartLabel: 'Attendance %',
    chartFileName: 'attendance-overview.png',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: 'Attendance %'
          }
        }
      },
      datasets: {
        bar: {
          borderRadius: 6,
          barThickness: 28,
          categoryPercentage: 0.6,
          barPercentage: 0.7
        }
      }
    }
  };
  tableData: any[] = [];

  constructor(private service: DashboardServiceService) {}

  ngOnInit(): void {
    this.getAccessForthisComponent();
    this.findingYear();
    this.loadDistrictData();
    console.log(this.role,this.user,'user role');
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

  findingYear(): void {
    const startYear = 2025;
    const endYear = this.currentYear + 1;
    this.years = [];
    for (let y = startYear; y <= endYear; y++) {
      this.years.push(y);
    }
    this.selectedYear = this.currentYear;
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.tableData = [];
    (this.service as any).getStatewiseDataForAttandance(
      this.selectedYear.toString(),
      this.selectedMonth,
      this.selectedDistrict,
      this.selectedBlock,
      this.selectedSector,
      this.selectedUser
    ).subscribe({
      next: (res) => {
        this.stateLevelData = res?.data || {};
        this.prepareJson();
        this.tableData = this.formatAttendanceRows(this.stateLevelData?.attendence_by_month || []);
        this.isLoading = false;
      },
      error: () => {
        this.tableData = [];
        this.isLoading = false;
      }
    });
  }

  private formatAttendanceRows(apiData: any[]): any[] {
    return apiData.map((item: any, index: number) => ({
      slNo: index + 1,
      id: item.id,
      group_id: item.id,
      name: item.name,
      total_children_available: item?.total_children_available || 0,
      total_children_present: item?.total_children_present || 0,
      total_children_absent: item?.total_children_absent || 0,
      attendance_percentage: Number(String(item?.attendance_percentage || '0').replace('%', ''))
    }));
  }

  private prepareJson(): void {
    const sectionType = this.selectedDistrict
      ? (this.selectedBlock ? 'Sector' : 'Block')
      : 'District';
    this.headerConfig = {
      ...this.headerConfig,
      title: `AWCs Attendance This Month by ${sectionType}`,
      sectionType
    };
    this.tableConfig = {
      enableSearch: true,
      showFooter: true,
      columns: [
        { key: 'slNo', label: 'Sl.No', sortable: true, align: 'left' },
        { key: 'name', label: `${sectionType} Name`, clickable: true, totalLabel: true },
        { key: 'total_children_available', label: 'Children Available', align: 'left', total: true },
        { key: 'total_children_present', label: 'Children Present', align: 'left', total: true },
        { key: 'total_children_absent', label: 'Children Absent', align: 'left', total: true },
        {
          key: 'attendance_percentage',
          label: 'Present %',
          suffix: '%',
          percentage: true,
          numeratorKey: 'total_children_present',
          denominatorKey: 'total_children_available',
          decimals: 2
        }
      ]
    };
    this.chartConfig = {
      ...this.chartConfig,
      labelColumnKey: 'name',
      dataColumnKey: 'attendance_percentage',
      chartLabel: `Attendance % by ${sectionType}`,
      chartFileName: `attendance-${sectionType.toLowerCase()}.png`
    };
  }

  onFilterChange(): void {
    this.loadDashboardData();
  }

  onUserChange(): void {
    this.loadDashboardData();
  }

  clearFilters(): void {
    if (this.isStateUser) {
      this.selectedDistrict = '';
      this.selectedBlock = '';
    } else if (this.isDistrictUser) {
      this.selectedBlock = '';
    }
    this.selectedSector = '';
    this.tableData = [];
    this.loadDashboardData();
  }

  onDistrictChange(): void {
    this.selectedBlock = '';
    this.selectedSector = '';
    this.blockData = [];
    this.sectorData = [];
    if (this.selectedDistrict) {
      this.loadBlockData(this.selectedDistrict);
    }
    this.loadDashboardData();
  }

  onBlockChange(): void {
    this.selectedSector = '';
    this.sectorData = [];
    if (this.selectedBlock) {
      this.loadSectorData(this.selectedBlock);
    }
    this.loadDashboardData();
  }

  onRowClick(row: any): void {
    let districtId: string | undefined;
    let sectorId: string | undefined;
    let blockId: string | undefined;

    if (this.selectedDistrict && this.selectedBlock) {
      sectorId = row?.group_id || row?.id;
    } else if (this.selectedDistrict) {
      blockId = row?.group_id || row?.id;
    } else {
      districtId = row?.group_id || row?.id;
    }

    this.service.AttendancelineTableExcelDownload(
      districtId,
      this.selectedYear.toString(),
      this.selectedMonth,
      sectorId,
      blockId,
      this.selectedUser
    ).subscribe((res: Blob) => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_Report_${this.selectedMonth}-${this.selectedYear}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  loadDistrictData(): void {
    const payload: any = {
      filter: { is_active: true },
      options: {
        sortBy: { district_name: 'asc' }
      }
    };
    if (this.isDistrictUser || this.isBlockUser) {
      payload.filter.district_id = this.user?.district_id;
    }
    this.service.postDistrictDatWithFilter(payload).subscribe({
      next: (res) => {
        this.districtData = res?.data?.result || [];
        if (this.isDistrictUser || this.isBlockUser) {
          this.selectedDistrict = this.districtData?.[0]?.district_id || '';
          this.loadBlockData(this.selectedDistrict);
        }
        this.loadDashboardData();
      },
      error: () => {
        this.loadDashboardData();
      }
    });
  }

  loadBlockData(districtId: string): void {
    const filter: any = {};
    if (this.isDistrictUser || this.isBlockUser) {
      filter.district_id = this.user?.district_id;
      if (this.isBlockUser) {
        filter.block_id = this.user?.block_id;
      }
    }
    if (districtId) {
      filter.district_id = districtId;
    }
    this.service.postBlockDataWithFilter(filter).subscribe({
      next: (res) => {
        this.blockData = (res?.data?.result || []).sort((a: any, b: any) =>
          a.block_name.localeCompare(b.block_name)
        );
        if (this.isBlockUser) {
          this.selectedBlock = this.blockData?.[0]?.block_id || '';
        }
      }
    });
  }

  loadSectorData(blockId: string): void {
    this.service.postSectorData(blockId).subscribe({
      next: (res) => {
        this.sectorData = res?.data?.result || [];
      }
    });
  }
}
