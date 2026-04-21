#include <asm/io.h>
#include <linux/module.h>
#include <linux/pci.h>
#include <linux/delay.h>
#include <linux/pid.h>
#include <linux/kernel.h>
#include <linux/kthread.h>
#include <linux/types.h>

// 保存edu设备信息
struct edu_dev_info
{
	resource_size_t io;
	long range, flags;
	void __iomem *ioaddr;
	int irq;
};

static struct pci_device_id id_table[] = {
	{PCI_DEVICE(0x1234, 0x11e8)}, // edu设备id
	{
		0,
	} // 最后一组是0，表示结束
};

struct edu_dev_info *edu_info;
spinlock_t lock;

/// @brief edu设备发现函数
/// @param dev 
/// @param id 
/// @return 
static int edu_driver_probe(struct pci_dev *dev, const struct pci_device_id *id)
{
	int ret = 0;
	printk("executing edu driver probe function!\n");

	ret = pci_enable_device(dev);
	if (ret)
	{
		printk(KERN_ERR "IO Error.\n");
		return -EIO;
	}

	edu_info = kmalloc(sizeof(struct edu_dev_info), GFP_KERNEL);
	if (!edu_info) {
		printk("kmalloc failed!\n");
		return -ENOMEM;
	}
	edu_info->irq = dev->irq;

	ret = pci_request_regions(dev, "edu_dirver"); // 申请一块驱动掌管的内存空间
	if (ret)
	{
		printk("PCI request regions err!\n");
		goto out_mypci;
	}

	edu_info->ioaddr = pci_ioremap_bar(dev, 0);
	if (!edu_info->ioaddr) {
		printk("pci_ioremap_bar failed!\n");
		ret = -ENOMEM;
		goto out_regions;
	}

	pci_set_drvdata(dev, edu_info); // 设置驱动私有数据
	printk("Probe succeeds.PCIE ioport addr start at %llX, edu_info->ioaddr is 0x%p.\n", edu_info->io, edu_info->ioaddr);

	return 0;

out_regions:
	pci_release_regions(dev);
out_mypci:
	kfree(edu_info);
	return ret;
}

/// @brief edu设备移除函数
/// @param dev 
static void edu_driver_remove(struct pci_dev *dev)
{
	struct edu_dev_info *edu_info = pci_get_drvdata(dev);

	iounmap(edu_info->ioaddr);
	pci_release_regions(dev);
	kfree(edu_info);

	pci_disable_device(dev);
	printk("Device is removed successfully.\n");
}

MODULE_DEVICE_TABLE(pci, id_table); // 暴露驱动能发现的设备ID表单

static struct pci_driver pci_driver = {
	.name = "edu_dirver",
	.id_table = id_table,
	.probe = edu_driver_probe,
	.remove = edu_driver_remove,
};

// =============================================================================== //

#define EDU_DEV_MAJOR 200  /* 主设备号 */
#define EDU_DEV_NAME "edu" /* 设备名 */


int current_id = 0;

struct user_data
{
	int id;
	atomic64_t data;
};

struct thread_data
{
	struct user_data* user_data_ptr;
	int input_data;
};


int kthread_handler(void *data)
{
	struct thread_data* thread_data_ptr = (struct thread_data*)data;
	uint64_t value = thread_data_ptr->input_data;
	uint64_t result = 0;
	printk("ioctl cmd 0 : factorial\n");

	spin_lock(&lock);
	// 向0x08寄存器写入待计算数值
	writel(value, edu_info->ioaddr + 0x08);
	spin_unlock(&lock);
	
	// 等待硬件计算完成
	msleep(100);
	
	spin_lock(&lock);
	// 从0x08寄存器读出阶乘结果
	result = readl(edu_info->ioaddr + 0x08);
	spin_unlock(&lock);
	
	// 原子写入结果
	atomic64_set(&thread_data_ptr->user_data_ptr->data, result);
	
	kfree(thread_data_ptr);
	return 0;
}



/// @brief open处理函数
/// @param inode 
/// @param filp 
/// @return 
static int edu_dev_open(struct inode *inode, struct file *filp)
{
	struct user_data* user_data_ptr = (struct user_data*)kmalloc(sizeof(struct user_data), GFP_KERNEL);
	if (!user_data_ptr) 
		return -ENOMEM;
	
	user_data_ptr->id = current_id++;
	atomic64_set(&user_data_ptr->data, 0);

	filp->private_data = user_data_ptr;
	
	return 0;
}


/// @brief close处理函数
/// @param inode 
/// @param filp 
/// @return 
static int edu_dev_release(struct inode *inode, struct file *filp)
{
	struct user_data* user_data_ptr = (struct user_data*)filp->private_data;
	if (user_data_ptr) {
		kfree(user_data_ptr);
		filp->private_data = NULL;
	}
	return 0;
}


/// @brief ioctl处理函数
/// @param pfilp_t 
/// @param cmd 
/// @param arg 
/// @return 
long edu_dev_unlocked_ioctl(struct file *pfilp_t, unsigned int cmd, unsigned long arg)
{
	struct user_data* user_data_ptr = pfilp_t->private_data;
	struct task_struct *thread;
	struct thread_data *td;

	switch(cmd) {
		case 0:
			// 传入数值，创建内核线程计算阶乘
			td = kmalloc(sizeof(*td), GFP_KERNEL);
			if (!td)
				return -ENOMEM;
			td->user_data_ptr = user_data_ptr;
			td->input_data = (int)arg;

			thread = kthread_create(kthread_handler, td, "edu_fact_thread");
			if (IS_ERR(thread)) {
				kfree(td);
				return PTR_ERR(thread);
			}
			wake_up_process(thread);
			break;

		case 1:
			// 获取计算结果，直接返回结果作为ioctl返回值
			return atomic64_read(&user_data_ptr->data);

		default:
			return -EINVAL;
	}

	return 0;
}


static struct file_operations edu_dev_fops = {
	.open = edu_dev_open,
	.release = edu_dev_release,
	.unlocked_ioctl = edu_dev_unlocked_ioctl,
};
/// @brief 驱动程序初始化
/// @param  
/// @return 
static int __init edu_dirver_init(void)
{
	printk("HELLO PCI\n");
	int ret = 0;
	// 注册字符设备
	ret = register_chrdev(EDU_DEV_MAJOR, EDU_DEV_NAME, &edu_dev_fops);
	if (0 > ret)
	{
		printk("kernel edu dev register_chrdev failure\n");
		return -1;
	}
	printk("chrdev edu dev is insmod, major_dev is 200\n");
	// 注册edu pci设备
	ret = pci_register_driver(&pci_driver);
	if (ret)
	{
		printk("kernel edu dev pci_register_driver failure\n");
		return ret;
	}
	// 初始化自旋锁
    spin_lock_init(&lock);
	return 0;
}
/// @brief 驱动程序注销
/// @param  
/// @return 
static void __exit edu_dirver_exit(void)
{
	// 注销字符设备
	unregister_chrdev(EDU_DEV_MAJOR, EDU_DEV_NAME);
	// 注销edu pci设备
	pci_unregister_driver(&pci_driver);
	printk("GOODBYE PCI\n");
}

MODULE_LICENSE("GPL");

module_init(edu_dirver_init);
module_exit(edu_dirver_exit);