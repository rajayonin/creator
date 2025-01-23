/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* DEVICES */

/**
 * A CREATOR device.
 *
 * @field {number} ctrl_addr: Address of the control register.
 * @field {number} status_addr: Address of the status register.
 * @field {Object} data: Device data range.
 * @field {number} data.start: Address of the start of the data range.
 * @field {number} data.end: Address of the end of the data range.
 * @field {boolean} [enabled=true]: Status of the device.
 *
 * @method callback: Function defining the behaviour of the device.
 *
 */
class Device {
    constructor({ctrl_addr, status_addr, data: {start, end}, enabled = true}) {
        this.ctrl_addr = ctrl_addr;
        this.status_addr = status_addr;
        this.data = {start: start, end: end};
        this.enabled = enabled;
    }

    /**
     * Checks whether the specified address belongs to the device.
     * 
     * @param {number} addr - Address to check.
     *
     * @return {boolean} `true` if it belongs to the device, else `false`.
     *
     */
    isDeviceAddr(addr) {
        return addr === this.ctrl_addr
               || addr === this.status_addr
               || (this.data.start <= addr < this.data.end);

    }

    /**
     * Called once per cycle, if the device is enabled, defines the behaviour
     * of the device.
     *
     */
    handler() { }

}

class ConsoleDevice extends Device {
    handler() {
        switch (capi_mem_read(this.ctrl_addr, 'w')) {
            case 0:
                return;

            case 1:  // write int
                display_print(full_print(capi_mem_read(this.data.start, 'w'), null, false));

        }

        // reset ctrl_addr
        capi_mem_write(this.ctrl_addr, 0, 'w')
    }
}


// { <id>: Device, ...}
const devices = {
    console: new ConsoleDevice({
        // TODO: use BigInt
        ctrl_addr: 0xF0000000,
        status_addr: 0xF0000004,
        data: {
            start: 0xF0000008,
            end: 0xF0000047
        },
        enabled: true,
    })
};



/* Memory */


/**
 * Checks if an address is a device address.
 *
 * @param {number} addr - Address to check.
 *
 * @return {string, null} ID of the device that the address belongs to, else `null`.
 */
function checkDeviceAddr(addr) {

    // TODO: precompute this???
    for (const [id, device] of Object.entries(devices)) {
        if (!device.enabled) continue;

        if (device.isDeviceAddr(adddr))
            return id;
    }

    return null;
}



/* Handlers */

/**
 * 'Wakes up' a device, by executing its callback function.
 *
 * @param {string} id - ID of the device.
 *
 */
function wakeDevice(id) {
    if (devices[id].enabled) devices[id].handler();
}


/**
 * Calls all the devices' handlers.
 *
 * @param {string} id - ID of the device.
 *
 */

function handleDevices() {
    for (const [id, device] of Object.entries(devices)) {
        if (device.enabled) device.handler();
    }
}

