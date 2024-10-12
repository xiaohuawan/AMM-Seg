# import os
# import cv2
# import pandas as pd
# import numpy as np
# from glob import glob
# from loguru import logger
# from PIL import Image, ImageDraw, ImageFont
# import requests
# from concurrent.futures import ThreadPoolExecutor
# import shutil
# import logging

# class MitoCompute:
#     def __init__(self, file_urls, download_dir="compute"):
#         self.download_dir = download_dir
#         self.save_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')
#         os.makedirs(self.save_dir, exist_ok=True)
#         os.makedirs(self.download_dir, exist_ok=True)  # Ensure compute directory exists
#         self.file_urls = file_urls  # List of URLs to download
#         self.img_shape = (800, 800)

#         # Download images
#         self.download_images()
#         print("***********", self.download_dir)

#         # Process downloaded images
#         self.imgList = glob(os.path.join(self.download_dir, '*.tif'))
#         self.imgList.sort()
#         self.all_imageName = []
#         self.allContours = []
#         self.label = []
#         self.cntLabel = 0
#         self.cntLabel_cutzero = 0
#         self.labelEqual = None

#     def download_images(self):
#         for url in self.file_urls:
#             file_name = os.path.basename(url)
#             file_path = os.path.join(self.download_dir, file_name)
            
#             if not os.path.exists(file_path):
#                 try:
#                     response = requests.get(url)
#                     response.raise_for_status()
#                     with open(file_path, 'wb') as file:
#                         file.write(response.content)
#                 except requests.RequestException as e:
#                     logging.error(f"Failed to download image from {url}: {e}")
#             else:
#                 logging.info(f"File already exists: {file_path}")

# # 剩余的类定义保持不变

#     def handle(self):
#         try:
#             self.getContours()
#             single_extral, single_inside, membOut, membInside = self.mito_info()
#             membInsideCutZero = []
#             membOutCutZero = []
#             single_extral_cutzero = []
#             single_inside_cutzero = []
#             labelCutZero = [-1] * len(membInside)
#             cnt = 0

#             for mindex, m in enumerate(membInside):
#                 if int(m) != 0:
#                     membInsideCutZero.append(int(m))
#                     membOutCutZero.append(membOut[mindex])
#                     single_extral_cutzero.append(single_extral[mindex])
#                     single_inside_cutzero.append(single_inside[mindex])
#                     labelCutZero[mindex] = cnt
#                     cnt += 1

#             self.cntLabel_cutzero = cnt
#             logger.info(f"剔除内膜为0的连通域后, 连通域数量为{self.cntLabel_cutzero}")
#             self.save_file(single_extral_cutzero, single_inside_cutzero, membOutCutZero, membInsideCutZero)
#             self.label_visualazation(labelCutZero, membInside)
#         except Exception as e:
#             logger.error(f"An error occurred in handle method: {e}")

#     def getContours(self):
#         logger.info("getContours start!!!")
#         try:
#             for imgindex, imgpath in enumerate(self.imgList):
#                 imgname = os.path.basename(imgpath)
#                 self.all_imageName.append(imgname)
#                 logger.info(f"imgname: {imgname}")

#                 imglabel = []
#                 img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
#                 contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#                 self.allContours.append(contours)

#                 if self.cntLabel == 0:
#                     self.cntLabel += len(contours)
#                     self.labelEqual = [-1] * self.cntLabel
#                     imglabel = np.arange(0, self.cntLabel)
#                 else:
#                     imglabel = np.zeros(len(contours))
#                     imglabel = self.setLabel(imglabel, self.label[imgindex - 1], img, contours, self.allContours[imgindex - 1])

#                 self.label.append(imglabel)

#             for i, labeli in enumerate(self.label):
#                 for j, l in enumerate(labeli):
#                     temp = int(l)
#                     while (self.labelEqual[int(temp)] != -1):
#                         temp = self.labelEqual[temp]
#                     self.label[i][j] = temp
#         except Exception as e:
#             logger.error(f"An error occurred in getContours method: {e}")
#         logger.info("getContours end!!!")
#     def setLabel(self, label1, label0, img, contour1, contour0):
#         """
#         设置标签,contour1参考contour0设置
#         给img_001记录标签,如果和img_000连通的轮廓就用img_000的label,不连通就创建新标签,即标签数量+1
#         """
#         for index1, cn1 in enumerate(contour1):
#             flag = 0
#             for index0, cn0 in enumerate(contour0):
#                 if self.contourIntersect(img, cn1, cn0):
#                     if label1[index1] != 0 and int(label0[index0]) != int(label1[index1]):  # 已有且不相等编号,证明上一张图片两个区域连通
#                         lmin = min(int(label0[index0]), int(label1[index1]))
#                         lmax = max(int(label0[index0]), int(label1[index1]))
#                         self.labelEqual[int(lmax)] = int(lmin)  # 设置label值为较小的一个
#                     else:
#                         label1[index1] = label0[index0]
#                     flag = 1
#                     # break
#             if flag == 0:
#                 label1[index1] = self.cntLabel
#                 self.cntLabel += 1
#                 self.labelEqual.append(-1)

#         return label1

#     def contourIntersect(self, img, contour1, contour2):
#         """
#         判断两个轮廓是否相交
#         这里需要再加其他的限定条件? 避免一张图片上的线粒体和上一张有编号的线粒体区域有重叠，算成一个了
#         """
#         # img作用是为创建空白画布提供大小
#         blank = np.zeros(img.shape[0:2])

#         temp1 = cv2.drawContours(blank.copy(), [contour1], -1, 1, thickness=cv2.FILLED)
#         temp2 = cv2.drawContours(blank.copy(), [contour2], -1, 1, thickness=cv2.FILLED)

#         intersection = np.logical_and(temp1, temp2)
#         return intersection.any()

#     def save_file(self, single_extral, single_inside, membOutLength, membInsideLength):
#         """
#         保存相关信息
#         """

#         adjust_single = []
#         for idx in range(len(self.all_imageName)):
#             row = [self.all_imageName[idx]]
#             for extral, inside in zip(single_extral, single_inside):
#                 row.append(extral[idx])
#                 row.append(inside[idx])
#             adjust_single.append(row)

#         # 保存每个图像的线粒体的计算结果
#         single_cols = ["image_name"]
#         for idx in range(self.cntLabel_cutzero):
#             single_cols += [f"label_{idx}_extral", f"label_{idx}_insider"]
#         # cols = [f"label_{idx}" for idx in range(1, cntLabel+1)]
#         single_df = pd.DataFrame(data=adjust_single, columns=single_cols)
#         single_df.to_csv(os.path.join(self.save_dir, "single_info.csv"), index=False)
#         logger.info("single_df save success!")

#         total_df = pd.DataFrame({
#             "label_name": [i for i in range(len(single_extral))],
#             "total_extral": membOutLength,
#             "total_inside": membInsideLength
#         })

#         total_df.to_csv(os.path.join(self.save_dir, "total_info.csv"), index=False)
#         logger.info("total_df save success!")

#     def mito_info(self):
#         """
#         计算线粒体内外膜信息
#         """
#         logger.info("mito_info start!!!")

#         # 记录外膜、内膜长度和
#         membOutLength, membInsideLength = [], []
#         # 记录每个图片的外膜周长和内膜周长
#         single_extral, single_inside = [], []

#         for cntl in range(1, self.cntLabel + 1):
#             logger.info(f"{cntl} ---> {self.cntLabel}")
#             labelOutLength = 0
#             labelInsideLength = 0
#             temp_single_extral, temp_single_inside = [], []

#             # 按图片(轮廓)遍历每张图片 计算单张图片的结果
#             for index, contour in enumerate(self.allContours):
#                 # print("index:", index)
#                 img = cv2.imread(self.imgList[index], cv2.COLOR_BGR2GRAY)
#                 img_single = np.zeros_like(img)

#                 # 提取每张图片对应label值的部分
#                 imgflag = 0  # flag=0代表该图片没有label值区域，在下面计算getInfo时跳过
#                 for indexcon, l in enumerate(self.label[index]):
#                     # imgflag=0
#                     if l == cntl - 1:  # cntLabel从1开始， l是label值从0开始
#                         imgflag = 1
#                         cv2.drawContours(img_single, [contour[indexcon]], -1, (255, 255, 255), thickness=cv2.FILLED)

#                 # 填充选定轮廓内部信息
#                 img_single[img == 0] = 0

#                 # 计算单张图片的信息
#                 if imgflag == 1:
#                     lenExternal, lenAllContours = self.getInfo(img_single)
#                     lenInside = lenAllContours - lenExternal

#                     temp_single_extral.append(lenExternal)
#                     temp_single_inside.append(lenInside)

#                     labelOutLength += lenExternal
#                     labelInsideLength += lenInside
#                 else:
#                     # -1代表该图没有该轮廓区域
#                     temp_single_extral.append(-1)
#                     temp_single_inside.append(-1)

#             single_extral.append(temp_single_extral)
#             single_inside.append(temp_single_inside)
#             membOutLength.append(labelOutLength)
#             membInsideLength.append(labelInsideLength)

#         logger.info("mito_info end!!!")

#         return single_extral, single_inside, membOutLength, membInsideLength

#     def getInfo(self, imgarray):
#         """
#         获取单个线粒体轮廓的长度
#         """
#         cn, _ = cv2.findContours(imgarray, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)  # 获取所有轮廓
#         cno, _ = cv2.findContours(imgarray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)  # 获取外轮廓

#         # 获取外膜内层轮廓
#         cntemp = []
#         cnolist = np.concatenate(cno)
#         for i in cn:  # 获取所有内部轮廓
#             if np.array_equal(i, cnolist):  # 除去最外轮廓
#                 continue
#             cntemp.append(i)

#         # 获取轮廓长度信息
#         lenExternal = cv2.arcLength(np.concatenate(cno), True)
#         lenAllContour = cv2.arcLength(np.concatenate(cn), True)

#         return lenExternal, lenAllContour

#     def label_visualazation(self, labelCutZero, membInsideLength):
#         """
#         可视化线粒体标签
#         """
#         logger.info("label_visualazation start!!!")

#         # membOutLength,membInsideLength = info[2],info[3]

#         # # 去除membInside为0的，并记录剩余的标签
#         # labelCutZero = [-1] * len(membInsideLength)
#         # cnt = 0
#         # for mindex, m in enumerate(membInsideLength):
#         #     if int(m)!=0:
#         #         labelCutZero[mindex] = cnt
#         #         cnt += 1

#         # 存储图片
#         visual_dir = os.path.join(self.save_dir, "visual")
#         # print(visual_dir)
#         os.makedirs(visual_dir, exist_ok=True)

#         if len(self.allContours) == 1:
#             logger.info("single thread")
#             self.sub_visual(0, labelCutZero, membInsideLength, visual_dir)
#         else:
#             logger.info("multi thread")

#             # 创建一个线程池执行器
#             # with ThreadPoolExecutor(max_workers=len(self.allContours) // 5) as executor:
#             with ThreadPoolExecutor(max_workers=8) as executor:

#                 # 准备传递给函数的参数列表
#                 args_list = [(i, labelCutZero, membInsideLength, visual_dir) for i in range(len(self.allContours))]
#                 # 使用executor.map来并发执行
#                 executor.map(lambda p: self.sub_visual(*p), args_list)

#     def sub_visual(self, i, labelCutZero, membInsideLength, visual_dir):
#         logger.info(f"sub_visual_{i} begin ---- {self.imgList[i]}")
#         contours = self.allContours[i]
#         file_name = self.imgList[i].split(os.sep)[-1].split(".tif")[0]
#         image_show = np.zeros((self.img_shape[0], self.img_shape[0], 3), dtype=np.uint8)  # 创建空白图像
#         img = cv2.imread(self.imgList[i], cv2.COLOR_BGR2GRAY)
#         drawLabel = np.zeros(self.cntLabel)  # 记录每张图已经绘制过的label标签，防止重复绘制 label text
#         drawLabelx = np.zeros(self.cntLabel)  # 记录绘制label text的坐标
#         drawLabely = np.zeros(self.cntLabel)
#         logger.info(1)
#         # 遍历单张图片的每个轮廓，获取label值并显示
#         for j, con in enumerate(contours):
#             conLabel = int(self.label[i][j])  # 获取轮廓的标签值
#             # logger.info(f"轮廓标签值{conLabel}")

#             # 内轮廓值为0，无效值
#             if int(membInsideLength[conLabel]) == 0:
#                 continue;

#             # 绘制轮廓
#             cv2.drawContours(image_show, [con], -1, (255, 255, 255), thickness=cv2.FILLED)
#             cv2.drawContours(image_show, [con], -1,
#                              ((conLabel * 20) % 255, (conLabel * 20 + 85) % 255, (conLabel * 20 + 170) % 255), 2)

#             # 如果已经绘制过标签text则跳过
#             if drawLabel[conLabel] == 1:
#                 continue

#             # 获取轮廓位置以显示标签数字
#             x, y, w, h = cv2.boundingRect(con)
#             if x + w / 2 >= img.shape[0] - 32:  # 超出显示范围
#                 drawx = img.shape[0] - 32
#             else:
#                 drawx = x + w / 2
#             if y + h / 2 >= img.shape[1] - 48:
#                 drawy = img.shape[1] - 48
#             else:
#                 drawy = y + h / 2
#             drawLabelx[conLabel] = drawx
#             drawLabely[conLabel] = drawy
#             drawLabel[conLabel] = 1  # 记录已经绘制的标签
#         logger.info(2)
#         # 创建PIL图像绘制文本
#         pil = Image.fromarray(cv2.cvtColor(image_show, cv2.COLOR_BGR2RGB))
#         draw = ImageDraw.Draw(pil)
#         # font = ImageFont.truetype('SourceCodePro-Black.ttf', size=36)
#         font = ImageFont.truetype('arial.ttf', size=36)
#         for dindex, d in enumerate(drawLabel):  # dindex即label值
#             if d == 1:
#                 draw.text((drawLabelx[dindex], drawLabely[dindex]), str(labelCutZero[dindex]), font=font,
#                           fill=(255, 0, 0))
#         image_show = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
#         logger.info(3)
#         # 填充轮廓内部
#         for m in range(0, img.shape[0]):
#             for n in range(0, img.shape[1]):
#                 if img[m][n] == 0 and np.equal(image_show[m][n], [0, 0, 255]).all() == False:
#                     image_show[m][n] = (0, 0, 0)
#         logger.info(4)
#         vis_path = os.path.join(visual_dir, f"{file_name}.png")
#         # print(vis_path)
#         logger.info(vis_path)
#         cv2.imwrite(vis_path, image_show)

#         logger.info(f"sub_visual_{i} end!!!")


# if __name__ == "__main__":
#     file_url = ""
#     mito_compute = MitoCompute(file_url=file_url)
#     mito_compute.handle()


# import os
# import cv2
# import pandas as pd
# import numpy as np
# from glob import glob
# from loguru import logger
# from PIL import Image, ImageDraw, ImageFont
# import requests
# from concurrent.futures import ThreadPoolExecutor
# import shutil
# import logging

# class MitoCompute:
#     def __init__(self, file_urls, download_dir="compute"):
#         self.download_dir = download_dir
#         self.save_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')
#         os.makedirs(self.save_dir, exist_ok=True)
#         os.makedirs(self.download_dir, exist_ok=True)  # Ensure compute directory exists
#         self.file_urls = file_urls  # List of URLs to download
#         self.img_shape = (800, 800)

#         # Download images
#         self.download_images()
#         print("***********", self.download_dir)

#         # Process downloaded images
#         self.imgList = glob(os.path.join(self.download_dir, '*.png'))
#         self.imgList.sort()
#         self.all_imageName = []
#         self.allContours = []
#         self.label = []
#         self.cntLabel = 0
#         self.cntLabel_cutzero = 0
#         self.labelEqual = None

#     def download_images(self):
#         for url in self.file_urls:
#             file_name = os.path.basename(url)
#             file_path = os.path.join(self.download_dir, file_name)
            
#             if not os.path.exists(file_path):
#                 try:
#                     response = requests.get(url)
#                     response.raise_for_status()
#                     with open(file_path, 'wb') as file:
#                         file.write(response.content)
#                 except requests.RequestException as e:
#                     logging.error(f"Failed to download image from {url}: {e}")
#             else:
#                 logging.info(f"File already exists: {file_path}")

# # 剩余的类定义保持不变

#     def handle(self):
#         try:
#             self.getContours()
#             single_extral, single_inside, membOut, membInside = self.mito_info()
#             membInsideCutZero = []
#             membOutCutZero = []
#             single_extral_cutzero = []
#             single_inside_cutzero = []
#             labelCutZero = [-1] * len(membInside)
#             cnt = 0

#             for mindex, m in enumerate(membInside):
#                 if int(m) != 0:
#                     membInsideCutZero.append(int(m))
#                     membOutCutZero.append(membOut[mindex])
#                     single_extral_cutzero.append(single_extral[mindex])
#                     single_inside_cutzero.append(single_inside[mindex])
#                     labelCutZero[mindex] = cnt
#                     cnt += 1

#             self.cntLabel_cutzero = cnt
#             logger.info(f"剔除内膜为0的连通域后, 连通域数量为{self.cntLabel_cutzero}")
#             self.save_file(single_extral_cutzero, single_inside_cutzero, membOutCutZero, membInsideCutZero)
#             self.label_visualazation(labelCutZero, membInside)
#         except Exception as e:
#             logger.error(f"An error occurred in handle method: {e}")

#     def getContours(self):
#         logger.info("getContours start!!!")
#         try:
#             for imgindex, imgpath in enumerate(self.imgList):
#                 imgname = os.path.basename(imgpath)
#                 self.all_imageName.append(imgname)
#                 logger.info(f"imgname: {imgname}")

#                 imglabel = []
#                 img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
#                 contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#                 self.allContours.append(contours)

#                 if self.cntLabel == 0:
#                     self.cntLabel += len(contours)
#                     self.labelEqual = [-1] * self.cntLabel
#                     imglabel = np.arange(0, self.cntLabel)
#                 else:
#                     imglabel = np.zeros(len(contours))
#                     imglabel = self.setLabel(imglabel, self.label[imgindex - 1], img, contours, self.allContours[imgindex - 1])

#                 self.label.append(imglabel)

#             for i, labeli in enumerate(self.label):
#                 for j, l in enumerate(labeli):
#                     temp = int(l)
#                     while (self.labelEqual[int(temp)] != -1):
#                         temp = self.labelEqual[temp]
#                     self.label[i][j] = temp
#         except Exception as e:
#             logger.error(f"An error occurred in getContours method: {e}")
#         logger.info("getContours end!!!")
#     def setLabel(self, label1, label0, img, contour1, contour0):
#         """
#         设置标签,contour1参考contour0设置
#         给img_001记录标签,如果和img_000连通的轮廓就用img_000的label,不连通就创建新标签,即标签数量+1
#         """
#         for index1, cn1 in enumerate(contour1):
#             flag = 0
#             for index0, cn0 in enumerate(contour0):
#                 if self.contourIntersect(img, cn1, cn0):
#                     if label1[index1] != 0 and int(label0[index0]) != int(label1[index1]):  # 已有且不相等编号,证明上一张图片两个区域连通
#                         lmin = min(int(label0[index0]), int(label1[index1]))
#                         lmax = max(int(label0[index0]), int(label1[index1]))
#                         self.labelEqual[int(lmax)] = int(lmin)  # 设置label值为较小的一个
#                     else:
#                         label1[index1] = label0[index0]
#                     flag = 1
#                     # break
#             if flag == 0:
#                 label1[index1] = self.cntLabel
#                 self.cntLabel += 1
#                 self.labelEqual.append(-1)

#         return label1

#     def contourIntersect(self, img, contour1, contour2):
#         """
#         判断两个轮廓是否相交
#         这里需要再加其他的限定条件? 避免一张图片上的线粒体和上一张有编号的线粒体区域有重叠，算成一个了
#         """
#         # img作用是为创建空白画布提供大小
#         blank = np.zeros(img.shape[0:2])

#         temp1 = cv2.drawContours(blank.copy(), [contour1], -1, 1, thickness=cv2.FILLED)
#         temp2 = cv2.drawContours(blank.copy(), [contour2], -1, 1, thickness=cv2.FILLED)

#         intersection = np.logical_and(temp1, temp2)
#         return intersection.any()

#     def save_file(self, single_extral, single_inside, membOutLength, membInsideLength):
#         """
#         保存相关信息
#         """

#         adjust_single = []
#         for idx in range(len(self.all_imageName)):
#             row = [self.all_imageName[idx]]
#             for extral, inside in zip(single_extral, single_inside):
#                 row.append(extral[idx])
#                 row.append(inside[idx])
#             adjust_single.append(row)

#         # 保存每个图像的线粒体的计算结果
#         single_cols = ["image_name"]
#         for idx in range(self.cntLabel_cutzero):
#             single_cols += [f"label_{idx}_extral", f"label_{idx}_insider"]
#         # cols = [f"label_{idx}" for idx in range(1, cntLabel+1)]
#         single_df = pd.DataFrame(data=adjust_single, columns=single_cols)
#         single_df.to_csv(os.path.join(self.save_dir, "single_info.csv"), index=False)
#         logger.info("single_df save success!")

#         total_df = pd.DataFrame({
#             "label_name": [i for i in range(len(single_extral))],
#             "total_extral": membOutLength,
#             "total_inside": membInsideLength
#         })

#         total_df.to_csv(os.path.join(self.save_dir, "total_info.csv"), index=False)
#         logger.info("total_df save success!")

#     def mito_info(self):
#         """
#         计算线粒体内外膜信息
#         """
#         logger.info("mito_info start!!!")

#         # 记录外膜、内膜长度和
#         membOutLength, membInsideLength = [], []
#         # 记录每个图片的外膜周长和内膜周长
#         single_extral, single_inside = [], []

#         for cntl in range(1, self.cntLabel + 1):
#             logger.info(f"{cntl} ---> {self.cntLabel}")
#             labelOutLength = 0
#             labelInsideLength = 0
#             temp_single_extral, temp_single_inside = [], []

#             # 按图片(轮廓)遍历每张图片 计算单张图片的结果
#             for index, contour in enumerate(self.allContours):
#                 # print("index:", index)
#                 img = cv2.imread(self.imgList[index], cv2.COLOR_BGR2GRAY)
#                 img_single = np.zeros_like(img)

#                 # 提取每张图片对应label值的部分
#                 imgflag = 0  # flag=0代表该图片没有label值区域，在下面计算getInfo时跳过
#                 for indexcon, l in enumerate(self.label[index]):
#                     # imgflag=0
#                     if l == cntl - 1:  # cntLabel从1开始， l是label值从0开始
#                         imgflag = 1
#                         cv2.drawContours(img_single, [contour[indexcon]], -1, (255, 255, 255), thickness=cv2.FILLED)

#                 # 填充选定轮廓内部信息
#                 img_single[img == 0] = 0

#                 # 计算单张图片的信息
#                 if imgflag == 1:
#                     lenExternal, lenAllContours = self.getInfo(img_single)
#                     lenInside = lenAllContours - lenExternal

#                     temp_single_extral.append(lenExternal)
#                     temp_single_inside.append(lenInside)

#                     labelOutLength += lenExternal
#                     labelInsideLength += lenInside
#                 else:
#                     # -1代表该图没有该轮廓区域
#                     temp_single_extral.append(-1)
#                     temp_single_inside.append(-1)

#             single_extral.append(temp_single_extral)
#             single_inside.append(temp_single_inside)
#             membOutLength.append(labelOutLength)
#             membInsideLength.append(labelInsideLength)

#         logger.info("mito_info end!!!")

#         return single_extral, single_inside, membOutLength, membInsideLength

#     def getInfo(self, imgarray):
#         """
#         获取单个线粒体轮廓的长度
#         """
#         cn, _ = cv2.findContours(imgarray, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)  # 获取所有轮廓
#         cno, _ = cv2.findContours(imgarray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)  # 获取外轮廓

#         # 获取外膜内层轮廓
#         cntemp = []
#         cnolist = np.concatenate(cno)
#         for i in cn:  # 获取所有内部轮廓
#             if np.array_equal(i, cnolist):  # 除去最外轮廓
#                 continue
#             cntemp.append(i)

#         # 获取轮廓长度信息
#         lenExternal = cv2.arcLength(np.concatenate(cno), True)
#         lenAllContour = cv2.arcLength(np.concatenate(cn), True)

#         return lenExternal, lenAllContour

#     def label_visualazation(self, labelCutZero, membInsideLength):
#         """
#         可视化线粒体标签
#         """
#         logger.info("label_visualazation start!!!")

#         # membOutLength,membInsideLength = info[2],info[3]

#         # # 去除membInside为0的，并记录剩余的标签
#         # labelCutZero = [-1] * len(membInsideLength)
#         # cnt = 0
#         # for mindex, m in enumerate(membInsideLength):
#         #     if int(m)!=0:
#         #         labelCutZero[mindex] = cnt
#         #         cnt += 1

#         # 存储图片
#         visual_dir = os.path.join(self.save_dir, "visual")
#         # print(visual_dir)
#         os.makedirs(visual_dir, exist_ok=True)

#         if len(self.allContours) == 1:
#             logger.info("single thread")
#             self.sub_visual(0, labelCutZero, membInsideLength, visual_dir)
#         else:
#             logger.info("multi thread")

#             # 创建一个线程池执行器
#             # with ThreadPoolExecutor(max_workers=len(self.allContours) // 5) as executor:
#             with ThreadPoolExecutor(max_workers=8) as executor:

#                 # 准备传递给函数的参数列表
#                 args_list = [(i, labelCutZero, membInsideLength, visual_dir) for i in range(len(self.allContours))]
#                 # 使用executor.map来并发执行
#                 executor.map(lambda p: self.sub_visual(*p), args_list)

#     def sub_visual(self, i, labelCutZero, membInsideLength, visual_dir):
#         logger.info(f"sub_visual_{i} begin ---- {self.imgList[i]}")
#         contours = self.allContours[i]
#         file_name = self.imgList[i].split(os.sep)[-1].split(".tif")[0]
#         image_show = np.zeros((self.img_shape[0], self.img_shape[0], 3), dtype=np.uint8)  # 创建空白图像
#         img = cv2.imread(self.imgList[i], cv2.COLOR_BGR2GRAY)
#         drawLabel = np.zeros(self.cntLabel)  # 记录每张图已经绘制过的label标签，防止重复绘制 label text
#         drawLabelx = np.zeros(self.cntLabel)  # 记录绘制label text的坐标
#         drawLabely = np.zeros(self.cntLabel)
#         logger.info(1)
#         # 遍历单张图片的每个轮廓，获取label值并显示
#         for j, con in enumerate(contours):
#             conLabel = int(self.label[i][j])  # 获取轮廓的标签值
#             # logger.info(f"轮廓标签值{conLabel}")

#             # 内轮廓值为0，无效值
#             if int(membInsideLength[conLabel]) == 0:
#                 continue;

#             # 绘制轮廓
#             cv2.drawContours(image_show, [con], -1, (255, 255, 255), thickness=cv2.FILLED)
#             cv2.drawContours(image_show, [con], -1,
#                              ((conLabel * 20) % 255, (conLabel * 20 + 85) % 255, (conLabel * 20 + 170) % 255), 2)

#             # 如果已经绘制过标签text则跳过
#             if drawLabel[conLabel] == 1:
#                 continue

#             # 获取轮廓位置以显示标签数字
#             x, y, w, h = cv2.boundingRect(con)
#             if x + w / 2 >= img.shape[0] - 32:  # 超出显示范围
#                 drawx = img.shape[0] - 32
#             else:
#                 drawx = x + w / 2
#             if y + h / 2 >= img.shape[1] - 48:
#                 drawy = img.shape[1] - 48
#             else:
#                 drawy = y + h / 2
#             drawLabelx[conLabel] = drawx
#             drawLabely[conLabel] = drawy
#             drawLabel[conLabel] = 1  # 记录已经绘制的标签
#         logger.info(2)
#         # 创建PIL图像绘制文本
#         pil = Image.fromarray(cv2.cvtColor(image_show, cv2.COLOR_BGR2RGB))
#         draw = ImageDraw.Draw(pil)
#         # font = ImageFont.truetype('SourceCodePro-Black.ttf', size=36)
#         font = ImageFont.truetype('arial.ttf', size=36)
#         for dindex, d in enumerate(drawLabel):  # dindex即label值
#             if d == 1:
#                 draw.text((drawLabelx[dindex], drawLabely[dindex]), str(labelCutZero[dindex]), font=font,
#                           fill=(255, 0, 0))
#         image_show = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
#         logger.info(3)
#         # 填充轮廓内部
#         for m in range(0, img.shape[0]):
#             for n in range(0, img.shape[1]):
#                 if img[m][n] == 0 and np.equal(image_show[m][n], [0, 0, 255]).all() == False:
#                     image_show[m][n] = (0, 0, 0)
#         logger.info(4)
#         vis_path = os.path.join(visual_dir, f"{file_name}.png")
#         # print(vis_path)
#         logger.info(vis_path)
#         cv2.imwrite(vis_path, image_show)

#         logger.info(f"sub_visual_{i} end!!!")


# if __name__ == "__main__":
#     file_url = ""
#     mito_compute = MitoCompute(file_url=file_url)
#     mito_compute.handle()


# import os
# import cv2
# import pandas as pd
# import numpy as np
# from glob import glob
# from loguru import logger
# from PIL import Image, ImageDraw, ImageFont
# import requests
# from concurrent.futures import ThreadPoolExecutor
# import shutil
# import logging
# import json

# class MitoCompute:
#     def __init__(self, file_urls, download_dir="compute"):
#         self.download_dir = download_dir
#         # Directory for saving outputs
#         self.save_dir = r'C:\Users\39767\Desktop\app1\berry-free-react-admin-template-main8.23\vite\public\outputs'
#         os.makedirs(self.save_dir, exist_ok=True)
#         os.makedirs(self.download_dir, exist_ok=True)  # Ensure compute directory exists
#         self.file_urls = file_urls  # List of URLs to download
#         self.img_shape = (800, 800)

#         # Download images
#         self.download_images()
#         print("***********", self.download_dir)

#         # Process downloaded images
#         self.imgList = glob(os.path.join(self.download_dir, '*.png'))
#         self.imgList.sort()
#         self.all_imageName = []
#         self.allContours = []
#         self.label = []
#         self.cntLabel = 0
#         self.cntLabel_cutzero = 0
#         self.labelEqual = None
        
#         # To store paths of visualized images
#         self.vis_image_paths = []

#     def download_images(self):
#         for url in self.file_urls:
#             file_name = os.path.basename(url)
#             file_path = os.path.join(self.download_dir, file_name)
            
#             if not os.path.exists(file_path):
#                 try:
#                     response = requests.get(url)
#                     response.raise_for_status()
#                     with open(file_path, 'wb') as file:
#                         file.write(response.content)
#                 except requests.RequestException as e:
#                     logging.error(f"Failed to download image from {url}: {e}")
#             else:
#                 logging.info(f"File already exists: {file_path}")

#     def handle(self):
#         try:
#             self.getContours()
#             single_extral, single_inside, membOut, membInside = self.mito_info()
#             membInsideCutZero = []
#             membOutCutZero = []
#             single_extral_cutzero = []
#             single_inside_cutzero = []
#             labelCutZero = [-1] * len(membInside)
#             cnt = 0

#             for mindex, m in enumerate(membInside):
#                 if int(m) != 0:
#                     membInsideCutZero.append(int(m))
#                     membOutCutZero.append(membOut[mindex])
#                     single_extral_cutzero.append(single_extral[mindex])
#                     single_inside_cutzero.append(single_inside[mindex])
#                     labelCutZero[mindex] = cnt
#                     cnt += 1

#             self.cntLabel_cutzero = cnt
#             logger.info(f"剔除内膜为0的连通域后, 连通域数量为{self.cntLabel_cutzero}")
#             self.save_file(single_extral_cutzero, single_inside_cutzero, membOutCutZero, membInsideCutZero)
#             self.label_visualazation(labelCutZero, membInside)

#             # 保存每张图片的标签数组为 .npy 文件
#             labeled_arrays = self.generate_labeled_arrays()
#             for img_index, img_name in enumerate(self.all_imageName):
#                 filename_without_extension = os.path.splitext(img_name)[0]
#                 filename = f"{filename_without_extension}.npy"
#                 filepath = os.path.join(self.save_dir, filename)
#                 np.save(filepath, labeled_arrays[img_index])
#                 logger.info(f"Saved {filename} to {self.save_dir}")
            
#             # Save the visual image paths to seg.json
#             self.save_vis_image_paths()

#         except Exception as e:
#             logger.error(f"An error occurred in handle method: {e}")

#     def generate_labeled_arrays(self):
#         labeled_arrays = []
#         for img_index, imgpath in enumerate(self.imgList):
#             img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
#             label_array = np.zeros_like(img, dtype=np.int32)
#             contours = self.allContours[img_index]
#             for j, contour in enumerate(contours):
#                 cv2.drawContours(label_array, [contour], -1, int(self.label[img_index][j]), thickness=cv2.FILLED)
#             labeled_arrays.append(label_array)
#         return labeled_arrays

#     def getContours(self):
#         logger.info("getContours start!!!")
#         try:
#             self.filtered_labeled_array = []  # 用于保存所有图片的标签数组
#             for imgindex, imgpath in enumerate(self.imgList):
#                 imgname = os.path.basename(imgpath)
#                 self.all_imageName.append(imgname)
#                 logger.info(f"imgname: {imgname}")

#                 imglabel = []
#                 img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
#                 contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#                 self.allContours.append(contours)

#                 if self.cntLabel == 0:
#                     self.cntLabel += len(contours)
#                     self.labelEqual = [-1] * self.cntLabel
#                     imglabel = np.arange(0, self.cntLabel)
#                 else:
#                     imglabel = np.zeros(len(contours))
#                     imglabel = self.setLabel(imglabel, self.label[imgindex - 1], img, contours, self.allContours[imgindex - 1])

#                 self.label.append(imglabel)

#                 for i, labeli in enumerate(self.label):
#                     for j, l in enumerate(labeli):
#                         temp = int(l)
#                         while (self.labelEqual[int(temp)] != -1):
#                             temp = self.labelEqual[temp]
#                         self.label[i][j] = temp
#         except Exception as e:
#             logger.error(f"An error occurred in getContours method: {e}")
#         logger.info("getContours end!!!")

#     def setLabel(self, label1, label0, img, contour1, contour0):
#         """
#         设置标签, contour1参考contour0设置
#         给img_001记录标签, 如果和img_000连通的轮廓就用img_000的label, 不连通就创建新标签, 即标签数量+1
#         """
#         for index1, cn1 in enumerate(contour1):
#             flag = 0
#             for index0, cn0 in enumerate(contour0):
#                 if self.contourIntersect(img, cn1, cn0):
#                     if label1[index1] != 0 and int(label0[index0]) != int(label1[index1]):  # 已有且不相等编号, 证明上一张图片两个区域连通
#                         lmin = min(int(label0[index0]), int(label1[index1]))
#                         lmax = max(int(label0[index0]), int(label1[index1]))
#                         self.labelEqual[int(lmax)] = int(lmin)  # 设置label值为较小的一个
#                     else:
#                         label1[index1] = label0[index0]
#                     flag = 1
#                     # break
#             if flag == 0:
#                 label1[index1] = self.cntLabel
#                 self.cntLabel += 1
#                 self.labelEqual.append(-1)

#         return label1

#     def contourIntersect(self, img, contour1, contour2):
#         """
#         判断两个轮廓是否相交
#         """
#         # img作用是为创建空白画布提供大小
#         blank = np.zeros(img.shape[0:2])

#         temp1 = cv2.drawContours(blank.copy(), [contour1], -1, 1, thickness=cv2.FILLED)
#         temp2 = cv2.drawContours(blank.copy(), [contour2], -1, 1, thickness=cv2.FILLED)

#         intersection = np.logical_and(temp1, temp2)
#         return intersection.any()

#     def save_file(self, single_extral, single_inside, membOutLength, membInsideLength):
#         adjust_single = []
#         for idx in range(len(self.all_imageName)):
#             row = [self.all_imageName[idx]]
#             for extral, inside in zip(single_extral, single_inside):
#                 row.append(extral[idx])
#                 row.append(inside[idx])
#             adjust_single.append(row)

#         single_cols = ["image_name"]
#         for idx in range(self.cntLabel_cutzero):
#             single_cols += [f"label_{idx}_extral", f"label_{idx}_insider"]
#         single_df = pd.DataFrame(data=adjust_single, columns=single_cols)
#         single_df.to_csv(os.path.join(self.save_dir, "single_info.csv"), index=False)
#         logger.info("single_df save success!")

#         total_df = pd.DataFrame({
#             "label_name": [i for i in range(len(single_extral))],
#             "total_extral": membOutLength,
#             "total_inside": membInsideLength
#         })

#         total_df.to_csv(os.path.join(self.save_dir, "total_info.csv"), index=False)
#         logger.info("total_df save success!")

#     def mito_info(self):
#         logger.info("mito_info start!!!")

#         membOutLength, membInsideLength = [], []
#         single_extral, single_inside = [], []

#         for cntl in range(1, self.cntLabel + 1):
#             logger.info(f"{cntl} ---> {self.cntLabel}")
#             labelOutLength = 0
#             labelInsideLength = 0
#             temp_single_extral, temp_single_inside = [], []

#             for index, contour in enumerate(self.allContours):
#                 img = cv2.imread(self.imgList[index], cv2.COLOR_BGR2GRAY)
#                 img_single = np.zeros_like(img)

#                 imgflag = 0  # flag=0代表该图片没有label值区域，在下面计算getInfo时跳过
#                 for indexcon, l in enumerate(self.label[index]):
#                     if l == cntl - 1:  # cntLabel从1开始, l是label值从0开始
#                         imgflag = 1
#                         cv2.drawContours(img_single, [contour[indexcon]], -1, (255, 255, 255), thickness=cv2.FILLED)

#                 img_single[img == 0] = 0

#                 if imgflag == 1:
#                     lenExternal, lenAllContours = self.getInfo(img_single)
#                     lenInside = lenAllContours - lenExternal

#                     temp_single_extral.append(lenExternal)
#                     temp_single_inside.append(lenInside)

#                     labelOutLength += lenExternal
#                     labelInsideLength += lenInside
#                 else:
#                     temp_single_extral.append(-1)
#                     temp_single_inside.append(-1)

#             single_extral.append(temp_single_extral)
#             single_inside.append(temp_single_inside)
#             membOutLength.append(labelOutLength)
#             membInsideLength.append(labelInsideLength)

#         logger.info("mito_info end!!!")

#         return single_extral, single_inside, membOutLength, membInsideLength

#     def getInfo(self, imgarray):
#         cn, _ = cv2.findContours(imgarray, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)  
#         cno, _ = cv2.findContours(imgarray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)  
#         cntemp = []
#         cnolist = np.concatenate(cno)
#         for i in cn:
#             if np.array_equal(i, cnolist):
#                 continue
#             cntemp.append(i)
#         lenExternal = cv2.arcLength(np.concatenate(cno), True)
#         lenAllContour = cv2.arcLength(np.concatenate(cn), True)
#         return lenExternal, lenAllContour

#     def label_visualazation(self, labelCutZero, membInsideLength):
#         logger.info("label_visualazation start!!!")

#         visual_dir = os.path.join(self.save_dir, "visual")
#         os.makedirs(visual_dir, exist_ok=True)

#         if len(self.allContours) == 1:
#             logger.info("single thread")
#             self.sub_visual(0, labelCutZero, membInsideLength, visual_dir)
#         else:
#             logger.info("multi thread")
#             with ThreadPoolExecutor(max_workers=8) as executor:
#                 args_list = [(i, labelCutZero, membInsideLength, visual_dir) for i in range(len(self.allContours))]
#                 executor.map(lambda p: self.sub_visual(*p), args_list)

#     def sub_visual(self, i, labelCutZero, membInsideLength, visual_dir):
#         logger.info(f"sub_visual_{i} begin ---- {self.imgList[i]}")
#         contours = self.allContours[i]
#         file_name = os.path.splitext(os.path.basename(self.imgList[i]))[0]
#         image_show = np.zeros((self.img_shape[0], self.img_shape[0], 3), dtype=np.uint8)
#         img = cv2.imread(self.imgList[i], cv2.COLOR_BGR2GRAY)
#         drawLabel = np.zeros(self.cntLabel)  # 记录每张图已经绘制过的label标签，防止重复绘制 label text
#         drawLabelx = np.zeros(self.cntLabel)  # 记录绘制label text的坐标
#         drawLabely = np.zeros(self.cntLabel)
#         logger.info(1)
#         for j, con in enumerate(contours):
#             conLabel = int(self.label[i][j])
#             if int(membInsideLength[conLabel]) == 0:
#                 continue

#             cv2.drawContours(image_show, [con], -1, (255, 255, 255), thickness=cv2.FILLED)
#             cv2.drawContours(image_show, [con], -1,
#                              ((conLabel * 20) % 255, (conLabel * 20 + 85) % 255, (conLabel * 20 + 170) % 255), 2)

#             if drawLabel[conLabel] == 1:
#                 continue

#             x, y, w, h = cv2.boundingRect(con)
#             drawx = x + w / 2 if x + w / 2 < img.shape[0] - 32 else img.shape[0] - 32
#             drawy = y + h / 2 if y + h / 2 < img.shape[1] - 48 else img.shape[1] - 48
#             drawLabelx[conLabel] = drawx
#             drawLabely[conLabel] = drawy
#             drawLabel[conLabel] = 1
#         logger.info(2)
#         pil = Image.fromarray(cv2.cvtColor(image_show, cv2.COLOR_BGR2RGB))
#         draw = ImageDraw.Draw(pil)
#         font = ImageFont.truetype('arial.ttf', size=36)
#         for dindex, d in enumerate(drawLabel):
#             if d == 1:
#                 draw.text((drawLabelx[dindex], drawLabely[dindex]), str(labelCutZero[dindex]), font=font,
#                           fill=(255, 0, 0))
#         image_show = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
#         logger.info(3)
#         for m in range(0, img.shape[0]):
#             for n in range(0, img.shape[1]):
#                 if img[m][n] == 0 and not np.array_equal(image_show[m][n], [0, 0, 255]):
#                     image_show[m][n] = (0, 0, 0)
#         logger.info(4)
#         vis_path = os.path.join(visual_dir, f"{file_name}.png")
#         logger.info(vis_path)
#         cv2.imwrite(vis_path, image_show)
#         logger.info(f"sub_visual_{i} end!!!")

#         # Store the URL format path
#         url_path = f"http://localhost:3000/free/outputs/visual/{file_name}.png"
#         self.vis_image_paths.append(url_path)

#     def save_vis_image_paths(self):
#         json_path = os.path.join(self.save_dir, "seg.json")
#         with open(json_path, 'w') as json_file:
#             json.dump(self.vis_image_paths, json_file, indent=4)
#         logger.info(f"Saved visual image paths to {json_path}")


# if __name__ == "__main__":
#     file_urls = ["http://localhost:3000/free/seg/png/data000.png"]  # Example URL; needs to be replaced with actual URL.
#     mito_compute = MitoCompute(file_urls=file_urls)
#     mito_compute.handle()

# import os
# import cv2
# import pandas as pd
# import numpy as np
# from glob import glob
# from loguru import logger
# from PIL import Image, ImageDraw, ImageFont
# import requests
# from concurrent.futures import ThreadPoolExecutor
# import shutil
# import logging
# import json

# class MitoCompute:
#     def __init__(self, file_urls, download_dir="compute"):
#         self.download_dir = download_dir
#         # Directory for saving outputs
#         self.save_dir = r'C:\Users\39767\Desktop\app1\berry-free-react-admin-template-main8.23\vite\public\outputs'
#         os.makedirs(self.save_dir, exist_ok=True)
#         os.makedirs(self.download_dir, exist_ok=True)  # Ensure compute directory exists
#         self.file_urls = file_urls  # List of URLs to download
#         self.img_shape = (800, 800)

#         # Download images
#         self.download_images()
#         print("***********", self.download_dir)

#         # Process downloaded images
#         self.imgList = glob(os.path.join(self.download_dir, '*.png'))
#         self.imgList.sort()
#         self.all_imageName = []
#         self.allContours = []
#         self.label = []
#         self.cntLabel = 0
#         self.cntLabel_cutzero = 0
#         self.labelEqual = None
        
#         # To store paths of visualized images
#         self.vis_image_paths = []

#     def download_images(self):
#         for url in self.file_urls:
#             file_name = os.path.basename(url)
#             file_path = os.path.join(self.download_dir, file_name)
            
#             if not os.path.exists(file_path):
#                 try:
#                     response = requests.get(url)
#                     response.raise_for_status()
#                     with open(file_path, 'wb') as file:
#                         file.write(response.content)
#                 except requests.RequestException as e:
#                     logging.error(f"Failed to download image from {url}: {e}")
#             else:
#                 logging.info(f"File already exists: {file_path}")

#     def handle(self):
#         try:
#             self.getContours()
#             single_extral, single_inside, membOut, membInside = self.mito_info()
#             membInsideCutZero = []
#             membOutCutZero = []
#             single_extral_cutzero = []
#             single_inside_cutzero = []
#             labelCutZero = [-1] * len(membInside)
#             cnt = 0

#             for mindex, m in enumerate(membInside):
#                 if int(m) != 0:
#                     membInsideCutZero.append(int(m))
#                     membOutCutZero.append(membOut[mindex])
#                     single_extral_cutzero.append(single_extral[mindex])
#                     single_inside_cutzero.append(single_inside[mindex])
#                     labelCutZero[mindex] = cnt
#                     cnt += 1

#             self.cntLabel_cutzero = cnt
#             logger.info(f"剔除内膜为0的连通域后, 连通域数量为{self.cntLabel_cutzero}")
#             self.save_file(single_extral_cutzero, single_inside_cutzero, membOutCutZero, membInsideCutZero)
#             self.label_visualazation(labelCutZero, membInside)

#             # 保存每张图片的标签数组为 .npy 文件
#             labeled_arrays = self.generate_labeled_arrays()
#             for img_index, img_name in enumerate(self.all_imageName):
#                 filename_without_extension = os.path.splitext(img_name)[0]
#                 filename = f"{filename_without_extension}.npy"
#                 filepath = os.path.join(self.save_dir, filename)
#                 np.save(filepath, labeled_arrays[img_index])
#                 logger.info(f"Saved {filename} to {self.save_dir}")
            
#             # Save the visual image paths to seg.json
#             self.save_vis_image_paths()

#         except Exception as e:
#             logger.error(f"An error occurred in handle method: {e}")

#     def generate_labeled_arrays(self):
#         labeled_arrays = []
#         for img_index, imgpath in enumerate(self.imgList):
#             img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
#             label_array = np.zeros_like(img, dtype=np.int32)
#             contours = self.allContours[img_index]
#             for j, contour in enumerate(contours):
#                 cv2.drawContours(label_array, [contour], -1, int(self.label[img_index][j]), thickness=cv2.FILLED)
#             labeled_arrays.append(label_array)
#         return labeled_arrays

#     def getContours(self):
#         logger.info("getContours start!!!")
#         try:
#             self.filtered_labeled_array = []  # 用于保存所有图片的标签数组
#             for imgindex, imgpath in enumerate(self.imgList):
#                 imgname = os.path.basename(imgpath)
#                 self.all_imageName.append(imgname)
#                 logger.info(f"imgname: {imgname}")

#                 imglabel = []
#                 img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
#                 contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#                 self.allContours.append(contours)

#                 if self.cntLabel == 0:
#                     self.cntLabel += len(contours)
#                     self.labelEqual = [-1] * self.cntLabel
#                     imglabel = np.arange(0, self.cntLabel)
#                 else:
#                     imglabel = np.zeros(len(contours))
#                     imglabel = self.setLabel(imglabel, self.label[imgindex - 1], img, contours, self.allContours[imgindex - 1])

#                 self.label.append(imglabel)

#                 for i, labeli in enumerate(self.label):
#                     for j, l in enumerate(labeli):
#                         temp = int(l)
#                         while self.labelEqual[int(temp)] != -1:
#                             temp = self.labelEqual[temp]
#                         self.label[i][j] = temp
#         except Exception as e:
#             logger.error(f"An error occurred in getContours method: {e}")
#         logger.info("getContours end!!!")


#     def setLabel(self, label1, label0, img, contour1, contour0):
#         """
#         设置标签, contour1参考contour0设置
#         给img_001记录标签, 如果和img_000连通的轮廓就用img_000的label, 不连通就创建新标签, 即标签数量+1
#         """
#         for index1, cn1 in enumerate(contour1):
#             flag = 0
#             for index0, cn0 in enumerate(contour0):
#                 if self.contourIntersect(img, cn1, cn0):
#                     if label1[index1] != 0 and int(label0[index0]) != int(label1[index1]):  # 已有且不相等编号, 证明上一张图片两个区域连通
#                         lmin = min(int(label0[index0]), int(label1[index1]))
#                         lmax = max(int(label0[index0]), int(label1[index1]))
#                         self.labelEqual[int(lmax)] = int(lmin)  # 设置label值为较小的一个
#                     else:
#                         label1[index1] = label0[index0]
#                     flag = 1
#                     # break
#             if flag == 0:
#                 label1[index1] = self.cntLabel
#                 self.cntLabel += 1
#                 self.labelEqual.append(-1)

#         return label1

#     def contourIntersect(self, img, contour1, contour2):
#         """
#         判断两个轮廓是否相交
#         """
#         # img作用是为创建空白画布提供大小
#         blank = np.zeros(img.shape[0:2])

#         temp1 = cv2.drawContours(blank.copy(), [contour1], -1, 1, thickness=cv2.FILLED)
#         temp2 = cv2.drawContours(blank.copy(), [contour2], -1, 1, thickness=cv2.FILLED)

#         intersection = np.logical_and(temp1, temp2)
#         return intersection.any()

#     def save_file(self, single_extral, single_inside, membOutLength, membInsideLength):
#         adjust_single = []
#         for idx in range(len(self.all_imageName)):
#             row = [self.all_imageName[idx]]
#             for extral, inside in zip(single_extral, single_inside):
#                 row.append(extral[idx])
#                 row.append(inside[idx])
#             adjust_single.append(row)

#         single_cols = ["image_name"]
#         for idx in range(self.cntLabel_cutzero):
#             single_cols += [f"label_{idx}_extral", f"label_{idx}_insider"]
#         single_df = pd.DataFrame(data=adjust_single, columns=single_cols)
#         single_df.to_csv(os.path.join(self.save_dir, "single_info.csv"), index=False)
#         logger.info("single_df save success!")

#         total_df = pd.DataFrame({
#             "label_name": [i for i in range(len(single_extral))],
#             "total_extral": membOutLength,
#             "total_inside": membInsideLength
#         })

#         total_df.to_csv(os.path.join(self.save_dir, "total_info.csv"), index=False)
#         logger.info("total_df save success!")

#     def mito_info(self):
#         logger.info("mito_info start!!!")

#         membOutLength, membInsideLength = [], []
#         single_extral, single_inside = [], []

#         for cntl in range(1, self.cntLabel + 1):
#             logger.info(f"{cntl} ---> {self.cntLabel}")
#             labelOutLength = 0
#             labelInsideLength = 0
#             temp_single_extral, temp_single_inside = [], []

#             for index, contour in enumerate(self.allContours):
#                 img = cv2.imread(self.imgList[index], cv2.COLOR_BGR2GRAY)
#                 img_single = np.zeros_like(img)

#                 imgflag = 0  # flag=0代表该图片没有label值区域，在下面计算getInfo时跳过
#                 for indexcon, l in enumerate(self.label[index]):
#                     if l == cntl - 1:  # cntLabel从1开始, l是label值从0开始
#                         imgflag = 1
#                         cv2.drawContours(img_single, [contour[indexcon]], -1, (255, 255, 255), thickness=cv2.FILLED)

#                 img_single[img == 0] = 0

#                 if imgflag == 1:
#                     lenExternal, lenAllContours = self.getInfo(img_single)
#                     lenInside = lenAllContours - lenExternal

#                     temp_single_extral.append(lenExternal)
#                     temp_single_inside.append(lenInside)

#                     labelOutLength += lenExternal
#                     labelInsideLength += lenInside
#                 else:
#                     temp_single_extral.append(-1)
#                     temp_single_inside.append(-1)

#             single_extral.append(temp_single_extral)
#             single_inside.append(temp_single_inside)
#             membOutLength.append(labelOutLength)
#             membInsideLength.append(labelInsideLength)

#         logger.info("mito_info end!!!")

#         return single_extral, single_inside, membOutLength, membInsideLength


#     def getInfo(self, imgarray):
#         cn, _ = cv2.findContours(imgarray, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)  
#         cno, _ = cv2.findContours(imgarray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)  
#         cntemp = []
#         cnolist = np.concatenate(cno)
#         for i in cn:
#             if np.array_equal(i, cnolist):
#                 continue
#             cntemp.append(i)
#         lenExternal = cv2.arcLength(np.concatenate(cno), True)
#         lenAllContour = cv2.arcLength(np.concatenate(cn), True)
#         return lenExternal, lenAllContour

#     def label_visualazation(self, labelCutZero, membInsideLength):
#         logger.info("label_visualazation start!!!")

#         visual_dir = os.path.join(self.save_dir, "visual")
#         os.makedirs(visual_dir, exist_ok=True)

#         if len(self.allContours) == 1:
#             logger.info("single thread")
#             self.sub_visual(0, labelCutZero, membInsideLength, visual_dir)
#         else:
#             logger.info("multi thread")
#             with ThreadPoolExecutor(max_workers=8) as executor:
#                 args_list = [(i, labelCutZero, membInsideLength, visual_dir) for i in range(len(self.allContours))]
#                 executor.map(lambda p: self.sub_visual(*p), args_list)

#     def sub_visual(self, i, labelCutZero, membInsideLength, visual_dir):
#         logger.info(f"sub_visual_{i} begin ---- {self.imgList[i]}")
#         contours = self.allContours[i]
#         file_name = os.path.splitext(os.path.basename(self.imgList[i]))[0]
#         image_show = np.zeros((self.img_shape[0], self.img_shape[0], 3), dtype=np.uint8)
#         img = cv2.imread(self.imgList[i], cv2.COLOR_BGR2GRAY)
#         drawLabel = np.zeros(self.cntLabel)  # 记录每张图已经绘制过的label标签，防止重复绘制 label text
#         drawLabelx = np.zeros(self.cntLabel)  # 记录绘制label text的坐标
#         drawLabely = np.zeros(self.cntLabel)
#         logger.info(1)
#         for j, con in enumerate(contours):
#             conLabel = int(self.label[i][j])
#             if int(membInsideLength[conLabel]) == 0:
#                 continue

#             cv2.drawContours(image_show, [con], -1, (255, 255, 255), thickness=cv2.FILLED)
#             cv2.drawContours(image_show, [con], -1,
#                              ((conLabel * 20) % 255, (conLabel * 20 + 85) % 255, (conLabel * 20 + 170) % 255), 2)

#             if drawLabel[conLabel] == 1:
#                 continue

#             x, y, w, h = cv2.boundingRect(con)
#             drawx = x + w / 2 if x + w / 2 < img.shape[0] - 32 else img.shape[0] - 32
#             drawy = y + h / 2 if y + h / 2 < img.shape[1] - 48 else img.shape[1] - 48
#             drawLabelx[conLabel] = drawx
#             drawLabely[conLabel] = drawy
#             drawLabel[conLabel] = 1
#         logger.info(2)
#         pil = Image.fromarray(cv2.cvtColor(image_show, cv2.COLOR_BGR2RGB))
#         draw = ImageDraw.Draw(pil)
#         font = ImageFont.truetype('arial.ttf', size=36)
#         for dindex, d in enumerate(drawLabel):
#             if d == 1:
#                 draw.text((drawLabelx[dindex], drawLabely[dindex]), str(labelCutZero[dindex]), font=font,
#                           fill=(255, 0, 0))
#         image_show = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
#         logger.info(3)
#         for m in range(0, img.shape[0]):
#             for n in range(0, img.shape[1]):
#                 if img[m][n] == 0 and not np.array_equal(image_show[m][n], [0, 0, 255]):
#                     image_show[m][n] = (0, 0, 0)
#         logger.info(4)
#         vis_path = os.path.join(visual_dir, f"{file_name}.png")
#         logger.info(vis_path)
#         cv2.imwrite(vis_path, image_show)
#         logger.info(f"sub_visual_{i} end!!!")

#         # Store the URL format path
#         url_path = f"http://localhost:3000/free/outputs/visual/{file_name}.png"
#         self.vis_image_paths.append(url_path)

#     def save_vis_image_paths(self):
#         json_path = os.path.join(self.save_dir, "seg.json")
#         with open(json_path, 'w') as json_file:
#             json.dump(self.vis_image_paths, json_file, indent=4)
#         logger.info(f"Saved visual image paths to {json_path}")


# if __name__ == "__main__":
#     file_urls = ["http://localhost:3000/free/seg/png/data000.png"]  # Example URL; needs to be replaced with actual URL.
#     mito_compute = MitoCompute(file_urls=file_urls)
#     mito_compute.handle()

import os
import cv2
import pandas as pd
import numpy as np
from tqdm import tqdm
from glob import glob
from scipy import ndimage
from loguru import logger
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
import zipfile
import shutil
import json
from urllib.parse import urlparse

class MitoCompute:
    def __init__(self, file_paths) -> None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        self.mito_segment_path = os.path.join(script_dir)

        # 创建用于保存图像的png目录
        self.save_image_dir = os.path.join(self.mito_segment_path, 'local_outputs')
        if os.path.exists(self.save_image_dir):
            shutil.rmtree(self.save_image_dir)
        os.makedirs(self.save_image_dir)
        # if not os.path.exists(self.save_image_dir):
        #     os.makedirs(self.save_image_dir)

        # 本地目录保存中间文件
        self.local_save_dir = os.path.join(self.mito_segment_path, 'local_outputs')
        # if not os.path.exists(self.local_save_dir):
        #     os.makedirs(self.local_save_dir)

        self.lable_dir = os.path.join(self.mito_segment_path, 'local_outputs')
        # if not os.path.exists(self.lable_dir):
        #     os.makedirs(self.lable_dir)
        target_directory = os.path.join(os.path.abspath('../../vite/public/outputs'))
        if os.path.exists(target_directory):
            shutil.rmtree(target_directory)
        os.makedirs(target_directory)

        self.all_imageName = []
        self.imgList = []
        self.images = []
        self.cntLabel = 0
        self.cntLabel_filtered = 0
        self.labeled_array = []
        self.images_labeled = []
        self.filtered_len_out = []
        self.filtered_len_inside = []
        self.filtered_labeled_array = []
        self.filtered_images_labeled = []
        self.filtered_single = []
        self.img_shape = (800, 800)

        print("local_save_dir", self.local_save_dir)

        # Initialize imgList from the paths provided during initialization
        if isinstance(file_paths, list):
            self.imgList = file_paths
        else:
            print("file_paths should be a list of paths.")
            return

        # Ensure each image can be read, raise an error if not readable
        self.check_image_paths(self.imgList)

    def is_url(self, path):
        """
        检查路径是否为URL
        """
        parsed = urlparse(path)
        return parsed.scheme in ('http', 'https')

    def check_image_paths(self, paths):
        """
        Validates and filters out invalid image paths
        """
        valid_img_formats = ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif']
        validated_paths = []

        for path in paths:
            if os.path.exists(path) and path.split('.')[-1].lower() in valid_img_formats:
                validated_paths.append(path)
            else:
                logger.error(f"Invalid or unreadable image path: {path}")

        self.imgList = validated_paths
        if not self.imgList:
            raise FileNotFoundError("No valid images found in the provided paths.")

        print("Validated image list: ", self.imgList)

    def handle(self):
        """
        处理图像，存储计算结果到本地，然后复制到目标目录
        """
        self.getContours()
        len_out, len_inside, single_len_out, single_len_inside = self.calculate(self.labeled_array, self.images_labeled, self.cntLabel)
        self.filtered(self.cntLabel, len_out, len_inside, single_len_out, single_len_inside)

        # 存储结果到本地
        pix_length = 5
        pix_height = 10
        self.filtered_len_out = [i * pix_length * pix_height for i in self.filtered_len_out]
        self.filtered_len_inside = [i * pix_length * pix_height for i in self.filtered_len_inside]
        total_df = pd.DataFrame({
            "label_name": [i + 1 for i in range(self.cntLabel_filtered)],
            "total_extral": self.filtered_len_out,
            "total_inside": self.filtered_len_inside
        })

        # 保存每个图像的线粒体的计算结果
        single_cols = ["image_name"]
        for i in range(self.cntLabel_filtered):
            single_cols += [f"label_{i + 1}_extral", f"label_{i + 1}_insider"]
        single_df = pd.DataFrame(data=self.filtered_single, columns=single_cols)
        single_df.to_csv(os.path.join(self.local_save_dir, "single_info.csv"), index=False)

        total_df.to_csv(os.path.join(self.local_save_dir, "total_info.csv"), index=False)
        logger.info("total_df saved locally!")

        # 保存处理后的图像到png目录中，并生成seg.json文件
        image_urls = []
        for img_index, img_name in enumerate(self.all_imageName):
            filename_without_extension = os.path.splitext(img_name)[0]
            filename = f"{filename_without_extension}.npy"
            filepath = os.path.join(self.lable_dir, filename)
            np.save(filepath, arr=self.filtered_labeled_array[img_index])

            # 保存每张处理后的图像到png目录中
            img_save_path = os.path.join(self.save_image_dir, f"{filename_without_extension}.png")
            self.filtered_images_labeled.append(cv2.imread(img_save_path))
            cv2.imwrite(img_save_path, self.filtered_images_labeled[img_index])
            
            # 生成对应的 URL
            image_url = f"http://localhost:3000/free/outputs/{filename_without_extension}.png"
            image_urls.append(image_url)

        # 保存seg.json
        with open(os.path.join(self.save_image_dir, 'seg.json'), 'w') as f:
            json.dump(image_urls, f, indent=4)
        
        logger.info("seg.json saved locally!")

        # 复制文件到目标目录
        self.copy_to_local_directory("single_info.csv")
        self.copy_to_local_directory("total_info.csv")
        for file_name in os.listdir(self.lable_dir):
            self.copy_to_local_directory(file_name)
        # 如果需要复制保存的图像
        for file_name in os.listdir(self.save_image_dir):
            self.copy_to_local_directory(file_name)

    def copy_to_local_directory(self, file_name):
        """
        复制文件到指定的本地目录
        """
        source_file_path = os.path.join(self.local_save_dir, file_name)
        # target_directory = r"C:\Users\39767\Desktop\app1\berry-free-react-admin-template-main8.23\vite\public\outputs"
        target_directory = os.path.join(os.path.abspath('../../vite/public/outputs'))
        target_file_path = os.path.join(target_directory, file_name)

        try:
            shutil.copy(source_file_path, target_file_path)
            logger.info(f"{file_name} copied successfully to {target_directory}!")
        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
        except PermissionError as e:
            logger.error(f"Permission error: {e}")
        except Exception as e:
            logger.error(f"Exception occurred while copying {file_name}: {str(e)}")

    def getContours(self):
        """
        获取连通域数量，给每张图片打上连通域序号标签
        """
        # 获取图片
        for imgindex, imgpath in enumerate(self.imgList):
            imgname = imgpath.split(os.sep)[-1]
            self.all_imageName.append(imgname)
            img = cv2.imread(imgpath, cv2.IMREAD_GRAYSCALE)
            if img is None:
                logger.error(f"Failed to read image: {imgpath}")
                continue
            self.images.append(img)
        
        if not self.images:
            raise ValueError("No valid images to process")
        
        self.img_shape = self.images[0].shape
        
        # 获取外侧轮廓并填充，寻找连通域
        imgs_fill = []
        for img in self.images:
            filled_image = np.copy(img)
            contours, _ = cv2.findContours(filled_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for contour in contours:
                cv2.drawContours(filled_image, [contour], 0, (255, 255, 255), thickness=cv2.FILLED)
            imgs_fill.append(filled_image)

        stacked_image_fill = np.stack(imgs_fill)
        self.labeled_array, self.cntLabel = ndimage.label(stacked_image_fill)
        logger.info(f"所有连通域数量为{self.cntLabel}")

        # 设置标签对应图片列表
        for index, labeled in enumerate(self.labeled_array):
            img_labeled = np.zeros(self.img_shape, dtype=np.uint8)
            img_labeled[labeled != 0] = 255
            img_labeled[self.images[index] == 0] = 0
            self.images_labeled.append(img_labeled)

    def calculate(self, labeled_array, images_labeled, cntLabel):
        """
        计算膜长度信息
        """
        len_out = np.zeros(cntLabel + 1)
        len_inside = np.zeros(cntLabel + 1)
        single_len_out = np.zeros((len(self.imgList), cntLabel + 1))
        single_len_inside = np.zeros((len(self.imgList), cntLabel + 1))

        with tqdm(total=self.labeled_array.shape[0], desc="calculating", unit="images") as pbar:
            for img_index, labeled in enumerate(labeled_array):
                labels = np.unique(labeled[labeled != 0])
                np.sort(labels)
                for label in labels:
                    if label >= len(len_out):
                        logger.error(f"Label {label} exceeds the size of len_out array with size {len(len_out)}.")
                        continue

                    label_img = np.zeros(self.img_shape, dtype=np.uint8)
                    label_img[labeled == label] = 255
                    label_img[images_labeled[img_index] == 0] = 0

                    label_img = label_img.astype(np.uint8)
                    img_all_contours, _ = cv2.findContours(label_img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                    img_out_contours, _ = cv2.findContours(label_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    # 长度计算
                    len_img_out = cv2.arcLength(np.concatenate(img_out_contours), True)
                    len_img_allcontours = cv2.arcLength(np.concatenate(img_all_contours), True)
                    len_img_inside = len_img_allcontours - len_img_out
                    single_len_out[img_index][label] = len_img_out
                    single_len_inside[img_index][label] = len_img_inside
                    # 加和
                    len_out[label] += len_img_out
                    len_inside[label] += len_img_inside
                pbar.update()
        return len_out, len_inside, single_len_out, single_len_inside

    def filtered(self, cntLabel, len_out, len_inside, single_len_out, single_len_inside):
        """
        去除内膜为0的部分，并在图像上标注每个线粒体的标签并绘制外膜颜色
        """
        filtered_labels = []
        for i in range(1, cntLabel + 1):
            if len_inside[i] != 0 and len_out[i] != 0:
                filtered_labels.append(i)
                self.filtered_len_out.append(len_out[i])
                self.filtered_len_inside.append(len_inside[i])
        self.cntLabel_filtered = len(filtered_labels)
        logger.info(f"剔除内膜为0的连通域后，连通域数量为{self.cntLabel_filtered}")

        # 参考映射 filter_refer[a]=b 表示原始标签为a的现在标签值是b
        filter_refer = np.zeros(cntLabel + 1)
        for index, label in enumerate(filtered_labels):
            filter_refer[label] = int(index) + 1
        filter_refer = filter_refer.astype(int)

        # 修改新的标签值
        self.filtered_labeled_array = np.copy(self.labeled_array)
        with tqdm(total=self.filtered_labeled_array.shape[0], desc="Processing", unit="images") as pbar:
            for index, img in enumerate(self.filtered_labeled_array):
                img[~np.isin(img, filtered_labels)] = 0
                img[:] = np.vectorize(lambda x: filter_refer[x])(img)
                pbar.update()

        # 标签图片相对应，并标注标签
        for index, labeled in enumerate(self.filtered_labeled_array):
            # 创建彩色图像用于绘制轮廓和标注
            img_labeled_color = cv2.cvtColor(self.images[index], cv2.COLOR_GRAY2BGR)

            # 生成每个线粒体的随机颜色
            np.random.seed(42)  # 固定随机种子，确保每次生成的颜色相同
            colors = {label: np.random.randint(0, 255, 3).tolist() for label in np.unique(labeled) if label != 0}

            # 获取每个线粒体的中心位置，并标注标签
            unique_labels = np.unique(labeled)
            for label in unique_labels:
                if label == 0:
                    continue  # 跳过背景标签

                # 创建mask并计算中心
                mask = np.zeros_like(labeled, dtype=np.uint8)
                mask[labeled == label] = 255

                # 找到外膜轮廓并绘制颜色
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cv2.drawContours(img_labeled_color, contours, -1, colors[label], 2)

                moments = cv2.moments(mask)
                if moments["m00"] != 0:
                    cX = int(moments["m10"] / moments["m00"])
                    cY = int(moments["m01"] / moments["m00"])

                    # 在彩色图像上绘制红色标签
                    label_text = f"{label}"
                    cv2.putText(img_labeled_color, label_text, (cX, cY), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            # 保存每张带编号的图像, 使用原始文件名
            filename_without_extension = os.path.splitext(self.all_imageName[index])[0]
            img_save_path = os.path.join(self.save_image_dir, f"{filename_without_extension}.png")
            self.filtered_images_labeled.append(img_labeled_color)
            cv2.imwrite(img_save_path, img_labeled_color)

        # 处理单个线粒体计算结果
        filtered_single_len_out = single_len_out[:, filtered_labels]
        filtered_single_len_inside = single_len_inside[:, filtered_labels]

        for i, iname in enumerate(self.all_imageName):
            row = [iname]
            for j in range(self.cntLabel_filtered):
                row.append(filtered_single_len_out[i][j])
                row.append(filtered_single_len_inside[i][j])
            self.filtered_single.append(row)

if __name__ == "__main__":
    # This should be a list of file paths or URLs for the images to be processed
    file_path = ["http://localhost:3000/free/seg/png/data000.png"]  # Replace with actual file paths or URLs
    mito_compute = MitoCompute(file_path)
    mito_compute.handle()



