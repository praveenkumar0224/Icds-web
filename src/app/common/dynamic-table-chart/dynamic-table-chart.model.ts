export type Align = 'left' | 'center' | 'right';

export interface HeaderConfig {
  title: string;
  sectionType?: string;
  showExcelDownload?: boolean;
  showChartDownload?: boolean;
  
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  clickable?: boolean;
  align?: Align;
  suffix?: string;
  total?: boolean;  
  average?: boolean;  
  weightKey?: string;     
  totalLabel?: boolean;     
  percentage?: boolean;
  numeratorKey?: string;     // observed column key
  denominatorKey?: string;   // total column key
  decimals?: number;         // optional rounding
  comparison?:any;
}

export interface TableConfig {
  enableSearch: boolean;
  showFooter?: boolean;     // 🔹 enable footer row
  columns: TableColumn[];
  excelFileName?: string;  // 🆕 Add this
  excelSheetName?: string; // 🆕 Add this
}

export interface ChartConfig {
    enabled: boolean;
    enableSort?: boolean;
    chartFileName?: string;
    dataColumnKey?: string;        // 🆕 Column key to use for chart data
    labelColumnKey?: string;       // 🆕 Column key to use for labels
    chartLabel?: string;           // 🆕 Label for the dataset
    backgroundColor?: string;      // 🆕 Bar color
    hoverBackgroundColor?: string; // 🆕 Hover color
    borderRadius?: number;         // 🆕 Border radius
    barThickness?: number;         // 🆕 Bar thickness
    options?: any;                 // Chart.js options
    
    // These will be auto-generated, no need to pass from parent
    data?: any;
    labels?: string[];
  }