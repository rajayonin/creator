/*
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso, Alejandro Calderon Mateos, Luis Daniel Casais Mezquida
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
               || (this.data.start <= addr) && (addr < this.data.end);

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

            case 1:  // print int
                creator_ga('execute', 'execute.syscall', 'execute.syscall.print_int');  // google analytics

                display_print(full_print(readMemory(this.data.start, 'integer'), null, false));

                break;

            case 2:  // print float
                creator_ga('execute', 'execute.syscall', 'execute.syscall.print_float');  // google analytics

                display_print(full_print(readMemory(this.data.start, 'float'), null, false));

                break;

            case 3:  // print double
                creator_ga('execute', 'execute.syscall', 'execute.syscall.print_double');  // google analytics

                display_print(full_print(readMemory(this.data.start, 'double'), null, false));

                break;

            case 4:  // print string
                creator_ga('execute', 'execute.syscall', 'execute.syscall.print_string');  // google analytics

                readMemory(capi_mem_read_string(this.data.start), null, false);

                break;

            case 5:  // read int
                creator_ga('execute', 'execute.syscall', 'execute.syscall.read_int');  // google analytics

                if (typeof document != "undefined") {
                    document.getElementById('enter_keyboard').scrollIntoView();
                }

                run_program = 3;
                keyboard_read((keystroke, params) => writeMemory(keystroke, this.data.start, 'integer'));  // it's ugly, I know, but the alternative is rewriting the function

                break;

            case 6:  // read float
                creator_ga('execute', 'execute.syscall', 'execute.syscall.read_float');  // google analytics

                if (typeof document != "undefined") {
                    document.getElementById('enter_keyboard').scrollIntoView();
                }

                run_program = 3;
                keyboard_read((keystroke, params) => writeMemory(keystroke, this.data.start, 'float'));

                break;

            case 7:  // read double
                creator_ga('execute', 'execute.syscall', 'execute.syscall.read_double');  // google analytics

                if (typeof document != "undefined") {
                    document.getElementById('enter_keyboard').scrollIntoView();
                }

                run_program = 3;
                keyboard_read((keystroke, params) => writeMemory(keystroke, this.data.start, 'double'));

                break;

            case 8: {  // read string
                creator_ga('execute', 'execute.syscall', 'execute.syscall.read_string');  // google analytics

                // get string max length & addr
                let curr_addr = this.data.start;

                let length = readMemory(curr_addr, 'word');
                curr_addr += word_size_bytes;

                let addr = readMemory(curr_addr, 'word');

                if (typeof document != "undefined") {
                    document.getElementById('enter_keyboard').scrollIntoView();
                }

                // read & store in specified addr
                run_program = 3;
                keyboard_read(
                    (keystroke, params) => {

                        for (let i = 0; (i < params.lenght) && (i < keystroke.length); i++) {
                            writeMemory(keystroke, params.addr, 'string');
                            params.addr += word_size_bytes;
                        }
                    },
                    {  // params
                        lenght: length,
                        addr: addr,
                    }
                );

                break;
            }

            case 11:  // print char
                creator_ga('execute', 'execute.syscall', 'execute.syscall.print_char');  // google analytics

                display_print(readMemory(this.data.start, 'char'), null, false);

                break;

            case 12:  // read char
                creator_ga('execute', 'execute.syscall', 'execute.syscall.read_char');  // google analytics

                if (typeof document != "undefined") {
                    document.getElementById('enter_keyboard').scrollIntoView();
                }

                run_program = 3;
                keyboard_read((keystroke, params) => writeMemory(keystroke, this.data.start, 'char'));

                break;
        }

        // reset ctrl_addr
        writeMemory(0, this.ctrl_addr, 'w')
    }
}

            //case 9: {  // sbrk
            //    creator_ga('execute', 'execute.syscall', 'execute.syscall.sbrk');  // google analytics
            //
            //    // get size
            //    let size = readMemory(this.data.start, 'integer');
            //    if (size < 0) {
            //        throw packExecute(true, "capi_syscall: negative size", 'danger', null) ;
            //    }
            //
            //    // malloc
            //    let addr = creator_memory_alloc(size) ;
            //
            //    // save addr
            //    writeMemory(addr, this.data.start, 'word');
            //
            //    break;
            //}
            //
            //case 10:  // exit
            //    capi_exit();
            //
            //    break;


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

        if (device.isDeviceAddr(addr))
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

