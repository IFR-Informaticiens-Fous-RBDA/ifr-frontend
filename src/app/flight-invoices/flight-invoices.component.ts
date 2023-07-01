import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../services/api.service';
import { FlightInvoiceService } from '../services/flight-invoice.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { SocketService } from '../services/socket.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

export interface FlightInvoice{
  fullname: string,
  year: number,
  month: number,
  Payment_Date: Date | null,
  Total_Cost: number
}

@Component({
  selector: 'app-flight-invoices',
  templateUrl: './flight-invoices.component.html',
  styleUrls: ['./flight-invoices.component.css'],
  providers: [MessageService]
})


export class FlightInvoicesComponent implements OnInit {

  displayedColumns: string[] = ['fullname', 'year', 'month', 'Payment_Date', 'Total_Cost', 'Action'];
  months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  selectedMonth: string = this.getMonthName(new Date().getMonth() - 1);

  getMonthName(monthIndex: number): string {
    const months = [    'January',    'February',    'March',    'April',    'May',    'June',    'July',    'August',    'September',    'October',    'November',    'December'  ];
    // ajuster le mois pour qu'il soit dans la plage valide de 0 à 11
    monthIndex = (monthIndex % 12 + 12) % 12;
    return months[monthIndex];
  }
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(private _api: ApiService, private _socket: SocketService, private _finance: FlightInvoiceService, private messageService: MessageService
    ) { }

  ngOnInit() {
    // Ici, vous pouvez initialiser vos données de facturation de vols
    this._socket.onReloadForEveryone().subscribe((data:any) => {

      this._api.getTypeRequest('finance/all-invoices/').subscribe((result:any) => {
        console.log(result)
        this.dataSource = new MatTableDataSource(result.data)
      })
    })

    this._api.getTypeRequest('finance/all-invoices/').subscribe((result:any) => {
      console.log(result)
      this.dataSource = new MatTableDataSource(result.data)
      })

  }

  convertTimeToMinutes(timeString: string) {
    const [hours, minutes] = timeString.split(':');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    return totalMinutes;
  }

  async downloadPDF(element: any) {
    console.log(element)
    let account_id: any = await this._api.getTypeRequest('user/account-id/'+element.ID).toPromise()
    console.log(account_id)
    const doc = new jsPDF();
    const rows : any[] = [];

    let invoice_data: any = await this._api.getTypeRequest('finance/get-invoice-data/' + account_id.data[0].ID + '/' + element.month).toPromise()
    console.log(invoice_data)
    var options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for(var i = 0; i < invoice_data.data.length; i++){
      const dateOfFlight = new Date(invoice_data.data[i].Date_Of_Flight); // cast to Date object
      const formattedDate = dateOfFlight.toLocaleDateString('fr-FR', options); // format as string
      const data = [

        formattedDate,
        invoice_data.data[i].Registration,
        invoice_data.data[i].Departure_ICAO_Code,
        invoice_data.data[i].Arrival_ICAO_Code,
        invoice_data.data[i].Engine_Start,
        invoice_data.data[i].Engine_Stop,
        this.convertTimeToMinutes(invoice_data.data[i].Engine_Time),
        invoice_data.data[i].FlyingCost,
        this.convertTimeToMinutes(invoice_data.data[i].Engine_Time) * invoice_data.data[i].FlyingCost
      ]
      rows.push(data)
    }

    const tableHeaders = [
      ['Date', 'Airplane', 'From', 'To', 'Begin', 'End', 'Duration', '€/min', 'Cost']
    ];

    doc.setLineWidth(0.5);
    var pageWidth = doc.internal.pageSize.width;
    // calculer la taille de la ligne à 90% de la largeur de la page
    var lineWidth = pageWidth * 0.9;
    var lineHeight = doc.internal.pageSize.height / 4;

    // calculer les coordonnées x pour centrer la ligne horizontalement
    var x = (pageWidth - lineWidth) / 2;
    var y = lineHeight; // position y pour centrer la ligne sur le tiers sup

    doc.line(x, y, x + lineWidth, y);
    autoTable(doc, {
      startY: doc.internal.pageSize.height / 3 + 10,
      head: tableHeaders,
      body: rows,
      headStyles: {
        fillColor: '#fff', // set the header background color
        textColor: '#000', // set the header text color
        fontStyle: 'bold', // set the header font style to bold
        lineWidth: 0.25, // set the header border width
        lineColor: '#000', // set the header border color
      },
      bodyStyles: {
        fillColor: '#fff',
        textColor: '#000', // set the body text color
        lineWidth: 0.25, // set the body border width
        lineColor: '#000', // set the body border color
      },
      alternateRowStyles: {
        fillColor: 'white'
      }
    });

    doc.addImage("../../assets/img/logo-best.jpg", 'JPEG', 135, 0, 70, 70);


    // Définir la police et la taille du texte
doc.setFont("Helvetica");
doc.setFontSize(18);

    // Définir les textes à écrire
    var text1 = "Royal";
    var text2 = "Belgian Defence Aeroclub";
    var text3 = "a.s.b.l. – v.z.w.";

    // Calculer la largeur de chaque texte
    var text1Width = doc.getTextWidth(text1);
    var text2Width = doc.getTextWidth(text2);
    var text3Width = doc.getTextWidth(text3);

    // Définir la position x de chaque texte pour centrer le texte entre les line breaks
    var text1X = 40;
    var text2X = text1X;
    var text3X = text2X;

    // Définir la position y des textes pour les placer dans le coin supérieur gauche de la page
    var text1Y = 20;
    var text2Y = text1Y + 10;
    var text3Y = text2Y + 10;

    // Écrire chaque texte en le centrant par rapport au texte précédent
    doc.text(text1, text1X, text1Y);
    doc.text(text2, text2X + text1Width / 2 - text2Width / 2, text2Y);
    doc.text(text3, text3X + text1Width / 2 - text3Width / 2, text3Y);
    // Ajouter le titre
    doc.setFontSize(14);
    doc.text('Facture', 10, 90);

    doc.setFontSize(14);
    var member_name = `Nom: ${element.fullname}`
    doc.text(member_name ,doc.internal.pageSize.width / 2 - doc.getTextWidth(member_name)/2, 90);

    doc.setFontSize(14);
    var today = new Date();
    var options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    var dateString = 'Date: '+ today.toLocaleDateString('fr-FR', options);

    doc.text(dateString, doc.internal.pageSize.width - doc.getTextWidth(dateString) - 10, 90);

    var adress_line1 = "Base Jean Offenberg";
    var adress_line2 = "Route Charlemagne 11";
    var adress_line3 = "5620 Florennes";

    doc.setFontSize(10);
    doc.text(adress_line1, 20, 50);
    doc.text(adress_line2, 20, 55);
    doc.text(adress_line3, 20, 60);
    // Ajouter les informations du client
    // a recup de la DBdoc.text(`Adresse: ${clientAddress}`, 20, 70);




    // Ajouter le total et les informations de paiement
    doc.setDrawColor(0, 0, 0); // set the border color to black
    doc.setLineWidth(0.25); // set the border width to 0.25
    doc.setFontSize(14);
    doc.text(`Total: ${element.Total_Cost} €`, 200, 250, undefined, 'right');

    // Draw a black border around the text
    const textWidth = doc.getStringUnitWidth(`Total: ${element.Total_Cost} €`) * doc.getFontSize() / doc.internal.scaleFactor;
    const textHeight = doc.getLineHeight() / doc.internal.scaleFactor;
    const startX = 200 - textWidth - 2;
    const startY = 250 - textHeight - 2;
    doc.rect(startX, startY, textWidth + 4, textHeight + 5, 'S');


    // Get the current page height
    const pageHeight = doc.internal.pageSize.height;

    // Get the current date and format it as a string
    const date = new Date(element.Due_Date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });


    const text = `Please deposit this sum before: ${date}`;
    const bankInfo = 'On BNP PARIBAS FORTIS: BE 73 0015 7813 7860';

    const tWidth = doc.getTextWidth(text);

    // Draw the text and line
    doc.setFontSize(12);
    doc.text(text, 20, doc.internal.pageSize.height - 50);
    doc.setLineWidth(0.5);
    doc.line(20, doc.internal.pageSize.height - 47, 10 + tWidth, doc.internal.pageSize.height - 47);

    // Draw the bank info
    doc.setFontSize(12);
    doc.text(bankInfo, 20, doc.internal.pageSize.height - 40);

    doc.save('flight-invoices.pdf');
  }

  async generateInvoice(){
    let date = new Date(`${this.selectedMonth} 1, 2000`);
    let monthNumber = date.getMonth() + 1;

    let invoice = await this._api.getTypeRequest('finance/generate-invoice/' + monthNumber).toPromise()
      .catch(error=>{
        this.messageService.add({severity:'error', summary:'Error', detail:error.error.error});
      })

    console.log(invoice)

    this._socket.reloadForEveryone()

  }
}

