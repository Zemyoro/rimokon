import { Client, Device, select, clear } from './client';
import rl from 'readline-sync';

async function main(): Promise<any> {
    const devices: Device[] = [];
    const deviceChoices: string[] = [];

    clear(true);
    console.log('Searching for devices, this will take a moment...');

    const discovered = await (await Client.discoverAll() as unknown as Promise<Device[]>);

    for (const device of discovered) {
        const deviceInfo = await device.info();
        device.mac = deviceInfo.wifiMac;
        device.eMac = deviceInfo.ethernetMac;
        device.serial = deviceInfo.serialNumber;
        device.type = deviceInfo.isStick ? 'STICK' : deviceInfo.isTv ? 'TV' : 'OTHER';
        device.name = deviceInfo.friendlyDeviceName;
        device.vendor = deviceInfo.vendorName;
        device.model = deviceInfo.modelName;
        device.applications = await device.apps();
        devices.push(device);
    }

    clear(true);

    if (!devices.length) {
        console.log('There are no devices available. Retry?');
        const retry = await select({ values: ['Yes', 'No'] }).catch(() => process.exit(0));
        if (!retry) return main();
        else process.exit(0);
    }

    for (const device of devices) {
        deviceChoices.push(`${device.vendor} | ${device.name} (${device.ip})`);
    }

    console.log('Select a device to control');

    const selectedDevice = await select({ values: deviceChoices }).catch(() => process.exit(0));
    const device = devices[selectedDevice.id as number];

    clear(true);

    async function RemoteHandler(number: number) {
        switch (number) {
            case 0:
                clear(true);
                console.log('Exiting Roku Remote...');
                process.exit(0);
                break;
            case 1:
                return true;
            case 2:
                const text = rl.question('Input text: ');
                if (text.length) await device.text(text);
                return;
            case 3:
                return device.keypress(Client.keys.BACK);
            case 4:
                return device.keypress(Client.keys.HOME);
            case 5:
                return device.keypress(Client.keys.UP);
            case 6:
                return device.keypress(Client.keys.DOWN);
            case 7:
                return device.keypress(Client.keys.SELECT);
            case 8:
                return device.keypress(Client.keys.LEFT);
            case 9:
                return device.keypress(Client.keys.RIGHT);
            case 10:
                return device.keypress(Client.keys.VOLUME_UP);
            case 11:
                return device.keypress(Client.keys.VOLUME_DOWN);
            case 12:
                return device.keypress(Client.keys.VOLUME_MUTE);
        }
    }

    async function remote(value: number): Promise<any> {
        clear(true);
        console.log(deviceChoices[selectedDevice.id as number]);
        const key = await select({
            values: [
                'Exit',
                'Devices',
                'Text',
                'Back',
                'Home',
                'Up',
                'Down',
                'OK',
                'Left',
                'Right',
                'Volume up',
                'Volume down',
                'Volume mute'
            ],
            defaultValue: value
        }).catch(() => process.exit(0));

        const exit = await RemoteHandler(key.id as number);
        if (exit) return main();
        else return remote(key.id as number);
    }

    return remote(0);
}

void main();