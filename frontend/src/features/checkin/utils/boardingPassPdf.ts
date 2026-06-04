import jsPDF from 'jspdf';

export interface BoardingPassPdfData {
  passengerName: string;
  seatNumber: string;
  route: string;
  airline: string;
  flightNumber: string;
  departure: string;
  gate: string;
  boardingTime: string;
  fromCode: string;
  toCode: string;
  pnr: string;
  sequence: string;
  cabinClass: string;
}

export const defaultBoardingPassData: BoardingPassPdfData = {
  passengerName: 'John Smith',
  seatNumber: '12A',
  route: 'London to Dubai',
  airline: 'British Airways',
  flightNumber: 'BA 107',
  departure: 'March 25, 2026 - 14:30',
  gate: 'TBA',
  boardingTime: '13:45',
  fromCode: 'LHR',
  toCode: 'DXB',
  pnr: 'ABC123',
  sequence: '001',
  cabinClass: 'Economy',
};

const drawBarcode = (doc: jsPDF, x: number, y: number) => {
  const widths = [1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3];
  let cursorX = x;

  doc.setFillColor(31, 41, 55);
  widths.forEach((width, index) => {
    if (index % 2 === 0) {
      doc.rect(cursorX, y, width, 22, 'F');
    }
    cursorX += width + 1;
  });
};

export const downloadBoardingPassPdf = (data: BoardingPassPdfData = defaultBoardingPassData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 58, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CARLTON AIRLINES', 16, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('BOARDING PASS', 16, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(data.passengerName.toUpperCase(), 16, 48);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(30);
  doc.text(data.fromCode, 18, 82);
  doc.text(data.toCode, 158, 82);

  doc.setDrawColor(245, 197, 24);
  doc.setLineWidth(1.2);
  doc.line(56, 75, 144, 75);
  doc.setFontSize(11);
  doc.text(data.flightNumber, 92, 71);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('ROUTE', 16, 102);
  doc.text('AIRLINE', 108, 102);
  doc.text('DEPARTURE', 16, 126);
  doc.text('BOARDING', 108, 126);
  doc.text('SEAT', 16, 150);
  doc.text('GATE', 68, 150);
  doc.text('CLASS', 120, 150);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.text(data.route, 16, 110);
  doc.text(data.airline, 108, 110);
  doc.text(data.departure, 16, 134);
  doc.text(data.boardingTime, 108, 134);
  doc.text(data.seatNumber, 16, 158);
  doc.text(data.gate, 68, 158);
  doc.text(data.cabinClass, 120, 158);

  doc.setDrawColor(229, 231, 235);
  doc.line(16, 174, pageWidth - 16, 174);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('PNR', 16, 188);
  doc.text('SEQUENCE', 68, 188);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(data.pnr, 16, 196);
  doc.text(data.sequence, 68, 196);

  drawBarcode(doc, 16, 214);
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`${data.pnr}${data.sequence}`, 16, 244);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Arrive at the airport at least 2 hours before departure. Gate closes 20 minutes before departure.', 16, 276);

  doc.save(`BoardingPass_${data.pnr}_${data.seatNumber}.pdf`);
};
