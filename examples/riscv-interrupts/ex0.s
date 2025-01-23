.kdata
				console_ctrl_addr: .word 0xF0000000
    			console_data_addr: .word 0xF0000008
.ktext
     			# prepare registers
                csrrw MCAUSE t0  # swap mcause w/ t0
                csrrw MSCRATCH t1  # swap t1 w/ mscratch

                # decode interruption

                # ecall
                li t1 256
				beq t0 t1 rti_ecall

rti_ecall:      # decode ecall
				li t1 1
				beq a7 t1 rti_print_int
                li t1 5
                beq a7 t1 rti_read_int

rti_print_int:  # store integer in device data (a0)
				li t1 console_data_addr  # get console data addr
      			lw t1 0(t1)
      			sw a0 0(t1)

                # print to console
                li t1 console_ctrl_addr
      			lw t1 0(t1)
      			sw a7 0(t1)

				j rti_end

rti_read_int:   # read from console
                li t1 console_ctrl_addr
      			lw t1 0(t1)
      			sw a7 0(t1)
                
                # store value back to a0
				li t1 console_data_addr
      			lw t1 0(t1)
      			lw a0 0(t1)

				j rti_end

rti_end:		csrrw MCAUSE t0  # restore t0
				csrrw MSCRATCH t1  # restore t1
				mret

.data

.text

main:  			# print 69
				li a7 1
				li a0 69
				ecall
                
                # read int
                li a7 5
				ecall

                jr ra

