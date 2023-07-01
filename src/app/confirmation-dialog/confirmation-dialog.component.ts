import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2>Confirmer les informations entrées</h2>
    <p>Êtes-vous sûr des informations entrées ?</p>
    <button mat-raised-button (click)="onConfirmClick()">Confirmer</button>
    <button mat-raised-button (click)="onCancelClick()">Annuler</button>
  `,
})
export class ConfirmationDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }
}
