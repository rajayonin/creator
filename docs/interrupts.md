# Managing interrupts in CREATOR

Interrupts are handled in the `execute_instruction()` function, after
fetching the instuction.
Interrupts are marked as enabled through the `interruptsEnabled`
variable, and checked through the `checkinterrupt()` function (which
uses the architecture-defined `interruptCheck`).

When an interrupt is detected, and interrupts are enabled, the
`handleInterrupt()` function is executed. This function changes the
execution mode to `ExecutionMode.Kernel`, stores the `program_counter`
register in the `exception_program_counter` register, and jumps to the
interruption handler address obtained through the architecture-defined
`getHandlerAddr`. Finally, it clears the interruption through the
architechitecture-defined `clearInterrupt`.


## Architecture definition
For interrupts to be managed correctly, the architecture definition file
must include the following properties:
- `interrupts.enabled: boolean`: Controls whether interrupts are enabled
by default.
- `interrupts.interruptCheck: string`: JS code to be executed in order
to check whether an interrupt happened. It must return an
`InterruptType` (if an interrupt happened) or `null` (if it didn't).
- `interrupts.enableCheck: string`: JS code to be executed in order to
check whether interrupts are enabled.
- `interrupts.interruptEnable: string`: JS code to be executed in order
to enable interrupts.
- `interrupts.interruptDisable: string`: JS code to be executed in order
to disable interrupts.
- `interrupts.getHandlerAddr: string`: JS code to be executed in order
to obtain the interrupt handler address.
- `interrupts.clearInterrupt: string`: JS code to be executed in order
to clear an interrupt.
- `interrupts.setInterruptCause: (InterruptType) => null`: JS arrow
(lambda) function to be executed in order to set an interrupt given an
interrupt type.


## Functions
The following functions, belonging to [js/creator_interrupt.js](../js/creator_interrupt.js), were implemented:
- `enableInterrupts(null) -> null`: Enables interrupts by calling
`architecture.interrupts.interruptEnable`.
- `disableInterrupts(null) -> null`: Disables interrupts by calling
`architecture.interrupts.interruptDisable`.
- `checkInterrupt(null) -> null`: Checks whether interrupts are enabled
- `handleInterrupt(null) -> null`: Handles an interrupt.

## Enums
- `InterruptType`
    - `Software`
    - `Timer`
    - `External`
    - `EnvironmentCall`
- `ExecutionMode`
    - `User`
    - `Kernel`

> [!NOTE]
> JS doesn't have enums _per se_, but we can hack our way into them.


## Variables
- `interruptsEnabled: bool`: status of the interrupts.
- `currentExecutionMode: ExecutionMode`: current execution mode.


<!-- TODO: example in RISC-V -->
