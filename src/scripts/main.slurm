#!/bin/bash
#SBATCH  -J  segment                ##作业名yolov5s_1
#SBATCH  --gres=gpu:a100:1             ##指定使用gpu资源,a100数量1
##SBATCH –N 1                          ##指定使用1个节点数
##SBATCH –n 1                          ##指定总任务数1
##SBATCH –o test.out                   ##指定输出文件
##SBATCH –e test.error                 ##指定错误输出文件
#SBATCH  --qos=a100g2_2                ##指定qos为a100g1
#SBATCH  -p a100                       ##指定队列a100
###程序部分
cd $SLURM_SUBMIT_DIR
/home/zhangfa1/.conda/envs/wxs_is/bin/python   main.py -c patient2_config