#
# Creator (https://creatorsim.github.io/creator/)
#

.kdata
				console_ctrl_addr: .word 0xF0000000
    			console_data_addr: .word 0xF0000008
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

				# 4 is print string
				li t1 4
				beq a7 t1 rti_print

				# 8 is read string
				li t1 8
				beq a7 t1 rti_read_string

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


rti_end:		csrrw MCAUSE t0  # restore t0
				csrrw MSCRATCH t1  # restore t1
				mret


.data
                space:   .zero 100  # space for our input string
                string1: .string "What's your name? "
    			string2: .string "Hello, "
.text

main:  			# ask for name
                la a0 string1
                li a7 4
                ecall

                # read name
                la a0 space
				li a1 10
                li a7 8
                ecall

                # print "Hello, "
                la a0 string2
                li a7 4
                ecall
                
                # print name
                la a0 space
                li a7 4
                ecall

                jr ra
