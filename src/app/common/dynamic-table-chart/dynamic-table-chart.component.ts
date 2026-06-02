// dynamic-table-chart.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { TableConfig, ChartConfig, HeaderConfig } from './dynamic-table-chart.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-dynamic-table-chart',
  templateUrl: './dynamic-table-chart.component.html',
  styleUrls: ['./dynamic-table-chart.component.scss']
})
export class DynamicTableChartComponent implements OnChanges, AfterViewInit {

  @Input() loading = false;
  @Input() headerConfig!: HeaderConfig;
  @Input() tableConfig!: TableConfig;
  @Input() tableData: any[] = [];
  @Input() chartConfig!: ChartConfig;

  @Output() rowClick = new EventEmitter<any>();
  @Output() downloadExcel = new EventEmitter<void>();
  @Output() downloadChart = new EventEmitter<void>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('barChart') barChartRef: any; // Reference to chart canvas

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }
  @Output() tabChange = new EventEmitter<number>();

  // selectedTabIndex = 0;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];

  // 🆕 Chart sorting properties
  chartSortOrder: 'asc' | 'desc' = 'desc';
  alphaSortOrder: 'asc' | 'desc' = 'asc';
  originalChartData: any = null; // Store original chart data

  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  private _selectedTabIndex = 0;

  get selectedTabIndex(): number {
    return this._selectedTabIndex;
  }

  set selectedTabIndex(val: number) {
    this._selectedTabIndex = val;
    this.tabChange.emit(val);
  }

  prepareChartData(): void {
    if (!this.chartConfig || !this.tableData?.length) return;

    const labelKey = this.chartConfig.labelColumnKey || 'name';
    const dataKey = this.chartConfig.dataColumnKey || 'value';

    // Extract labels and data from tableData
    const labels = this.tableData.map(row =>
      String(row[labelKey] || '').toUpperCase()
    );

    const values = this.tableData.map(row => {
      const val = row[dataKey];
      return Number(val) || 0;
    });

    // Store original data for sorting
    this.originalChartData = {
      labels: [...labels],
      values: [...values]
    };

    // Merge default options with user-provided options
    const mergedOptions = { ...this.barChartOptions, ...(this.chartConfig.options || {}) };
    // Ensure datalabels are hidden even if plugins were overridden
    mergedOptions.plugins = {
      ...this.barChartOptions.plugins,
      ...(this.chartConfig.options?.plugins || {}),
      datalabels: { display: false } // Always hide datalabels as per requirement
    };

    this.chartConfig = {
      ...this.chartConfig,
      labels: labels,
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            label: this.chartConfig.chartLabel || 'Value',
            backgroundColor: this.chartConfig.backgroundColor || '#5D87FF',
            hoverBackgroundColor: this.chartConfig.hoverBackgroundColor || '#4a6cd8',
            borderRadius: this.chartConfig.borderRadius ?? 6,
          }
        ]
      },
      options: mergedOptions
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    // ─── tableConfig changed → rebuild columns ───────────────
    if (changes['tableConfig']) {
      if (this.tableConfig?.columns?.length) {
        // Force new array reference so mat-table re-renders headers
        this.displayedColumns = [];                                    // ← clear first
        setTimeout(() => {                                             // ← let DOM clear
          this.displayedColumns = [...this.tableConfig.columns.map(c => c.key)];
        }, 0);
      } else {
        this.displayedColumns = [];
        this.dataSource.data = [];
        return;
      }
    }

    // ─── tableData changed → update rows ────────────────────
    if (changes['tableData']) {
      this.dataSource.data = [...(this.tableData ?? [])];             // ← spread forces new ref
    }

    // ─── chartConfig changed → store original ───────────────
    if (changes['chartConfig'] && this.chartConfig) {
      this.originalChartData = JSON.parse(JSON.stringify(this.chartConfig));
    }

    // ─── tableData changed → rebuild chart ──────────────────
    if (changes['tableData'] && this.tableData?.length > 0 && this.chartConfig?.enabled) {
      this.prepareChartData();
    }

    // ─── chartConfig changed → rebuild chart ────────────────
    if (changes['chartConfig'] && this.chartConfig?.enabled && this.tableData?.length > 0) {
      this.prepareChartData();
    }
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.dataSource.filter = value.trim().toLowerCase();
  }

  getColumnAverage(col: any): string {
    if (!this.dataSource?.data?.length) return '0';

    const data = this.dataSource.data;

    // ─── Weighted average (when weightKey is provided) ───────
    if (col.weightKey) {
      const totalWeight = data.reduce((acc, row) => {
        return acc + (Number(row?.[col.weightKey]) || 0);
      }, 0);

      if (!totalWeight) return '0';

      const weightedSum = data.reduce((acc, row) => {
        const value = Number(row?.[col.key]) || 0;
        const weight = Number(row?.[col.weightKey]) || 0;
        return acc + (value * weight);
      }, 0);

      return (weightedSum / totalWeight).toFixed(1);
    }

    // ─── Simple average (fallback) ───────────────────────────
    const validRows = data.filter(row => row?.[col.key] != null && row?.[col.key] !== '');
    if (!validRows.length) return '0';

    const sum = validRows.reduce((acc, row) => {
      return acc + (Number(row?.[col.key]) || 0);
    }, 0);

    return (sum / validRows.length).toFixed(1);
  }

  getColumnTotal(key: string): number {
    if (!this.dataSource?.data) return 0;

    return this.dataSource.data.reduce((sum, row) => {
      const value = Number(row?.[key]);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }

  getPercentageTotal(col: any): string {
    if (!col?.numeratorKey || !col?.denominatorKey) return '-';

    const numerator = this.getColumnTotal(col.numeratorKey);
    const denominator = this.getColumnTotal(col.denominatorKey);

    if (!denominator) return '0';

    return ((numerator / denominator) * 100).toFixed(col.decimals ?? 2);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  //  Chart sorting methods
  toggleChartSort(type: 'number' | 'alpha'): void {
    if (!this.chartConfig?.data) return;

    if (type === 'number') {
      this.chartSortOrder = this.chartSortOrder === 'asc' ? 'desc' : 'asc';
      this.sortChartData(this.chartSortOrder, 'number');
    } else {
      this.alphaSortOrder = this.alphaSortOrder === 'asc' ? 'desc' : 'asc';
      this.sortChartData(this.alphaSortOrder, 'alpha');
    }
  }

  sortChartData(order: 'asc' | 'desc', type: 'number' | 'alpha'): void {
    if (!this.originalChartData) return;

    const { labels, values } = this.originalChartData;

    // Combine labels and values for sorting
    const combined = labels.map((label: string, index: number) => ({
      label,
      value: values[index]
    }));

    let sorted = [];

    if (type === 'number') {
      // Sort by value
      sorted = combined.sort((a, b) => {
        return order === 'asc'
          ? a.value - b.value
          : b.value - a.value;
      });
    } else {
      // Sort alphabetically by label
      sorted = combined.sort((a, b) => {
        return order === 'asc'
          ? a.label.localeCompare(b.label)
          : b.label.localeCompare(a.label);
      });
    }

    // Update chart config with sorted data
    this.chartConfig = {
      ...this.chartConfig,
      labels: sorted.map(item => item.label),
      data: {
        ...this.chartConfig.data,
        labels: sorted.map(item => item.label),
        datasets: [{
          ...this.chartConfig.data.datasets[0],
          data: sorted.map(item => item.value)
        }]
      }
    };
  }

  //  Download methods
  handleDownloadExcel(): void {
    const fileName = this.tableConfig?.excelFileName || 'table-data.xlsx';
    const sheetName = this.tableConfig?.excelSheetName || 'Data';

    const worksheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook = {
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    FileSaver.saveAs(new Blob([excelBuffer]), fileName);
  }

  handleDownloadChart(): void {
    const canvas = this.barChartRef?.nativeElement;

    if (!canvas) {
      console.warn('Chart canvas not found.');
      return;
    }

    // Create temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Fill background with white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw existing chart on top
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to image and download
    const image = tempCanvas.toDataURL('image/png');
    const fileName = this.chartConfig?.chartFileName || 'chart.png';

    const link = document.createElement('a');
    link.href = image;
    link.download = fileName;
    link.click();
  }
  getComparisonClass(status: string): string {
    switch (status) {
      case 'greater':
        return 'cmp-up';
      case 'equal':
        return 'cmp-equal';
      case 'less':
        return 'cmp-down';
      default:
        return '';
    }
  }
}