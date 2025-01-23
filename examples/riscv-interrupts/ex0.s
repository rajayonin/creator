.kdata
				console_ctrl_addr: .word 0xF0000000
    			console_data_addr: .word 0xF0000008
				os_ctrl_addr: .word 0xF0000010
				os_data_addr: .word 0xF0000018
.ktext
     			# prepare registers
                csrrw MCAUSE t0  # swap mcause w/ t0
                csrrw MSCRATCH t1  # swap t1 w/ mscratch
				# we can now work w/ t0 & t1

                # decode interruption

                # ecall
                li t1 256
				beq t0 t1 rti_ecall

rti_ecall:      # decode ecall

				# 1-4, 11 are generic prints
				li t1 4
				ble a7 t1 rti_print
				li t1 11
				beq a7 t1 rti_print

				# 5-7, 12 are generic word reads
				li t1 7
				ble a7 t1 rti_read
				li t1 12
				beq a7 t1 rti_read

				li t1 8
				beq a7 t1 rti_read_string

				li t1 9
                beq a7 t1 rti_sbrk

				li t1 10
                beq a7 t1 rti_exit

				j rti_end

rti_print:      # store in device data (a0)
				li t1 console_data_addr  # get console data addr
      			lw t1 0(t1)
      			sw a0 0(t1)

                # print to console
                li t1 console_ctrl_addr
      			lw t1 0(t1)
      			sw a7 0(t1)

				j rti_end

rti_read:       # read from console
                li t1 console_ctrl_addr
      			lw t1 0(t1)
      			sw a7 0(t1)

                # store value back to a0
				li t1 console_data_addr
      			lw t1 0(t1)
      			lw a0 0(t1)

				j rti_end

rti_read_string:
				li t1 console_data_addr
      			lw t1 0(t1)
      			sw a0 0(t1)  # save string addr
      			sw a1 4(t1)  # save len

				# signal device
                li t1 console_ctrl_addr
      			lw t1 0(t1)
      			sw a7 0(t1)

                # store value back to a0
				li t1 console_data_addr
      			lw t1 0(t1)
      			lw a0 0(t1)

				j rti_end

rti_sbrk:       # reserve memory

				# store lenght
				li t1 os_data_addr
      			lw t1 0(t1)
      			sw a0 0(t1)

                # signal driver
                li t1 os_ctrl_addr
      			lw t1 0(t1)
      			sw a7 0(t1)

                # store addr back to a0
				li t1 os_data_addr
      			lw t1 0(t1)
      			lw a0 0(t1)

				j rti_end

rti_exit:       # bye-bye
                li t1 os_ctrl_addr
      			lw t1 0(t1)
      			sw a7 0(t1)

				j rti_end

rti_end:		csrrw MCAUSE t0  # restore t0
				csrrw MSCRATCH t1  # restore t1
				mret


.data
                space:   .zero 100  # space for our input string
.text

main:  			# print 69
				li a7 1
				li a0 69
				ecall

                # read int
                li a7 5
				ecall

                # read string
                la a0 space
				li a1 10
                li a7 8
                ecall

                # print string
                la a0 space
                li a7 4
                ecall

                jr ra