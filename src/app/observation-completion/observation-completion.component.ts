import { Component, OnInit } from '@angular/core';
import { DashboardServiceService } from "../shared/services/dashboard-service.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-observation-completion',
  templateUrl: './observation-completion.component.html',
  styleUrls: ['./observation-completion.component.scss']
})
export class ObservationCompletionComponent implements OnInit {
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

  constructor(
    private service: DashboardServiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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