import { CalendarMomentDateFormatter, DateFormatterParams } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

export class CustomDateFormatter extends CalendarMomentDateFormatter {
  public currentTimeMarker({ date, locale }: DateFormatterParams): string {
    return `
      <span
        class="cal-time"
        style="position: absolute; bottom: 0; width: 100%; text-align: center;"
      >
        ${new DatePipe(locale!).transform(moment.utc().toDate(), 'HH:mm')} <!-- affiche l'heure actuelle en UTC -->
      </span>
    `;
  }
}
