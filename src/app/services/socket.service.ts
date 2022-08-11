import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	constructor(private socket: Socket) { }

  reloadForEveryone(){
    this.socket.emit('reloadForEveryone');
  }

  onReloadForEveryone(){
    return this.socket.fromEvent('reloadForEveryone');
  }
}
