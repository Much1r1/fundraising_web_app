declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    headStyles?: any;
    theme?: string;
  }
  
  function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  
  export default autoTable;
}
