import { RokuClient, Keys, RokuApp } from 'roku-client';
import clear from 'console-clear';
import select from 'cli-select';

export class Client extends RokuClient {
    static keys = Keys; // Placing keys on the extended client will allow for easier remote usage
}

export interface Device extends Client {
    ip: string;
    mac: string;
    eMac: string;
    serial: string;
    type: 'TV' | 'STICK' | 'OTHER';
    name: string;
    vendor: string;
    model: string;
}

export { select, clear };