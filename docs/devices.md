# Devices in CREATOR
Devices in CREATOR simulate the behaviour of different components that the simulator can interact with, e.g. a terminal, a hard drive, etc.

The code interacts with a device throught the program memory, a device specifies a set of "special" memory addresses that can be read and written by both the code and the device.

Devices are implemented in [js/creator_devices.js](../js/creator_devices.js).



## Device definition
A device is defined by the following:
- An identifier (`id`), which uniquely identifies the device.
- A _control register address_ (`ctrl_addr`), which is typically used by the processor to signal an action to perform on the device.
- An _status register address_ (`status_addr`), which is typically used by the device to signal its status to the processor.
- An _data range_ (`data`), which defines a section of memory (`start` and `end`) that is shared between the processor and the device, typically for the exchange of data.
- A _handler function_ (`handler()`), which is called once per cycle, and defines the behaviour of the device.
- An _enabled_ flag (`enabled`), which controls whether the device is enabled or not. If it's not, the callback is not called.

To create a new device, create a new class extending `Device` and implementing its `handler` method. Then, instanciate that object and add it to `devices` with its corresponding ID.



## Device handling
After executing each instruction, the executor calls `handleDevices()`, which executes the handlers for all enabled devices.

Typically, a device reads its control register and checks its value. If it's `0`, it exits. If it's not, it works with the other data and clears the control register when it ends.



## Implemented devices

### `ConsoleDevice`
A device for interacting with CREATOR's console.

Depending of the value stored in the control register, it executes one of the following:
- _write int_ (`1`): Reads a word from the `data.start` address and writes it as an integer value in the console.

