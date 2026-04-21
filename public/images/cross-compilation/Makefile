CC=gcc
CFLAGS=-std=c11

ifneq  ($(KERNELRELEASE),)
obj-m:=edu_dev.o
else
KDIR := ~/tools/linux-kernel-6.6.48/linux/
PWD:=$(shell pwd)

all:
	make -C $(KDIR) M=$(PWD) modules
	$(CC) $(CFLAGS) -o user_space user_space.c

clean:
	rm -f *.ko *.o *.symvers *.cmd *.cmd.o .*.cmd *.mod *.mod.c *.order
	rm user_space

install:
	make -C $(KDIR) M=$(PWD) modules
	sudo insmod edu_dev.ko
	sudo mknod /dev/edu c 200 200 

uninstall:
	sudo rmmod edu_dev
	sudo rm -rf /dev/edu

endif