.data
	console_ctrl_addr: .word 0xF0000000
    console_data_addr: .word 0xF0000008

.text
	main:
      # store data
      li t0 69
      li t2 console_data_addr
      lw t1 0(t2)
      sw t0 0(t1)
      # store ctrl
      li t2 console_ctrl_addr
      lw t1 0(t2)
      li t0 1
      sw t0 0(t1)
