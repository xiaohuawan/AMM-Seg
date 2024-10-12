// import React, { Component } from 'react'
// import * as echarts from 'echarts';
// import geoJson from './map/china.json'
// import { BorderBox1 ,BorderBox8 ,BorderBox13,Decoration1 ,ScrollBoard,ScrollRankingBoard } from '@jiaminghi/data-view-react'
// import './index2.css'
// import { useNavigate } from 'react-router-dom';
// import { Button } from 'antd';
// import Papa from 'papaparse';
// import npyjs from 'npyjs';


// function BackButton() {
//   const navigate = useNavigate();
//   return (
//     <Button 
//       type="primary" 
//       style={{ position: 'absolute', top: '15px', left: '70px', zIndex: 1000 }}
//       onClick={() => navigate(-1)}
//     >
//       返回
//     </Button>
//   );
// }

// class App extends Component {
  

//   state = {
//     chartData: [],
//     labelData: null, // 当前标签对应的数据
//     totalData: [],
//     imageFiles1: [],
//     currentImageIndex1: 0,
//     imageFiles2: [],
//     currentImageIndex2: 0,
//     topdata: {},
//     tabledata: {},
//     tableData2: [], 
//     labelValue: null, // 当前线粒体标签值
//     tooltipStyle: { display: 'none', position: 'absolute', top: 0, left: 0 },
//   };
  
//   async componentDidMount() {
//     try {
//       await Promise.all([this.loadImages1(), this.loadImages2(), this.loadCSVSingle(), this.loadCSVTotal()]);
//       this.initializeCharts();
//     } catch (error) {
//       console.error('Error during component mount:', error);
//     }

//     window.addEventListener('resize', this.handleResize);
//   }

//   componentWillUnmount() {
//     window.removeEventListener('resize', this.handleResize);
//   }

//   async loadCSVSingle() {
//     try {
//       const response = await fetch('/free/outputs/single_info.csv');
//       const csvData = await response.text();
//       Papa.parse(csvData, {
//         header: true,
//         dynamicTyping: true,
//         complete: (result) => {
//           this.setState({ chartData: result.data }, this.updateChart1);
//         },
//         error: (error) => console.error('解析CSV文件出错:', error),
//       });
//     } catch (error) {
//       console.error('Error fetching single CSV:', error);
//     }
//   }

//   async loadCSVTotal() {
//     try {
//       const response = await fetch('/free/outputs/total_info.csv');
//       const csvData = await response.text();
//       Papa.parse(csvData, {
//         header: true,
//         dynamicTyping: true,
//         complete: (result) => {
//           this.setState({ totalData: result.data }, this.updateChart2);
//         },
//         error: (error) => console.error('解析CSV文件出错:', error),
//       });
//     } catch (error) {
//       console.error('Error fetching total CSV:', error);
//     }
//   }
//   async loadImages1() {
//     try {
//       const response = await fetch('/free/outputs/seg.json');
//       // const response = await fetch('/free/seg/png_paths.json');
//       if (!response.ok) throw new Error('Network response was not ok');
//       const imagePaths1 = await response.json();
//       this.setState({ imageFiles1: imagePaths1, currentImageIndex1: 0 });
//     } catch (error) {
//       console.error('Error loading image paths:', error);
//     }
//   }

//   async loadImages2() {
//     try { 
//       // const response = await fetch('/free/seg_source/source_paths.json');
//       const response = await fetch('/free/seg/png_paths.json');
//       if (!response.ok) throw new Error('Network response was not ok');
//       const imagePaths2 = await response.json();
//       this.setState({ imageFiles2: imagePaths2, currentImageIndex2: 0 });
//     } catch (error) {
//       console.error('Error loading source image paths:', error);
//     }
//   }

//   async fetchLabelFromNpy(x, y) {
//     try {
//       const imageName = this.state.imageFiles1[this.state.currentImageIndex1];
//       if (!imageName) throw new Error('当前图像文件名未定义');

//       const fileName = imageName.split('/').pop().replace(/\.[^/.]+$/, '');
//       const filePath = `/free/outputs/${fileName}.npy`;
//       const npy = new npyjs();

//       const response = await fetch(filePath);
//       const buffer = await response.arrayBuffer();
//       const npyData = await npy.load(buffer);

//       if (!npyData || !npyData.data) throw new Error('npyData 或 npyData.data 不存在');

//       const width = 800;
//       const height = 800;

//       const index = y * width + x;
//       if (index < 0 || index >= npyData.data.length) {
//         console.error('索引超出数据范围:', index);
//         return;
//       }

//       const labelValue = npyData.data[index];
//       this.setState({ labelValue }, this.fetchDataForLabel); // 获取标签后，获取该标签的对应数据
//     } catch (error) {
//       console.error('获取 npy 文件出错:', error);
//     }
//   }
  

//   handleMouseMove = (event) => {
//     const img = event.currentTarget.querySelector('img'); // 获取图片元素
//     const rect = img.getBoundingClientRect(); // 获取图片的边界矩形
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
  
//     // 计算缩放比例
//     const scaleX = img.naturalWidth / img.width;
//     const scaleY = img.naturalHeight / img.height;
  
//     // 缩放坐标
//     const xIndex = Math.floor(x * scaleX);
//     const yIndex = Math.floor(y * scaleY);
  
//     // 更新tooltip样式以显示鼠标位置
//     this.setState({
//       tooltipStyle: {
//         display: 'block',
//         top: event.clientY + 15,
//         left: event.clientX + 15,
//       }
//     });
//   }
  

//   fetchDataForLabel = async () => {
//     const { chartData, labelValue, imageFiles1, currentImageIndex1 } = this.state;
//     if (chartData.length === 0) return;
  
//     let currentData = null;
  
//     try {
//       // 获取当前图像的 URL
//       const imageUrl = imageFiles1[currentImageIndex1];
//       if (!imageUrl) throw new Error('当前图像文件名未定义');
  
//       // 从 URL 中提取文件名
//       const fileName = imageUrl.split('/').pop().replace(/\.[^/.]+$/, '') + '.png';      
  
//       // 查找图像对应的数据行
//       const dataRow = chartData.find(data => data.image_name === fileName);
//       if (dataRow) {
//         if (labelValue === 0) {
//           // 如果标签为0，返回所有数据
//           currentData = { ...dataRow };
//         } else {
//           // 标签为1到14时，提取对应的外部和内部数据
//           currentData = {
//             extral: dataRow[`label_${labelValue}_extral`],
//             insider: dataRow[`label_${labelValue}_insider`]
//           };
//         }
//       } else {
//         console.error('未找到对应图像的数据:', fileName);
//       }
//     } catch (error) {
//       console.error('获取标签数据时出错:', error);
//     }

//     // const extralSum = currentData.extral.reduce((sum, value) => sum + value, 0);
//     // const insiderSum = currentData.insider.reduce((sum, value) => sum + value, 0);
//     const extralSum = currentData.extral.reduce((sum, value) => sum + (value || 0), 0);
//     const insiderSum = currentData.insider.reduce((sum, value) => sum + (value || 0), 0);
  

//     this.setState({ 
//       labelData: currentData,
//       tableData2: [{ 
//         images_name: imageFiles1[currentImageIndex1], 
//         extralData_sum: extralSum, 
//         insiderData_sum: insiderSum 
//       }]
//     });
    
//   };
  
  
  
  
//   handleClick = (event) => {
//     const img = event.currentTarget.querySelector('img'); // 获取图片元素
//     const rect = img.getBoundingClientRect(); // 获取图片的边界矩形
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
  
//     // 计算缩放比例
//     const scaleX = img.naturalWidth / img.width;
//     const scaleY = img.naturalHeight / img.height;
  
//     // 缩放坐标
//     const xIndex = Math.floor(x * scaleX);
//     const yIndex = Math.floor(y * scaleY);
  
//     this.fetchLabelFromNpy(xIndex, yIndex);
//   }
  
  
//   handleMouseLeave = () => {
//     this.setState({ tooltipStyle: { display: 'none' } });
//   }

  
//   updateChart1 = () => {
//     const svgElement = document.querySelector('svg[width="200px"][height="50px"]');

//     // 如果找到，则删除该元素
//     if (svgElement) {
//         svgElement.remove();
//     }
//     const { chartData, currentImageIndex1 } = this.state;
//     const currentData = chartData[currentImageIndex1];
  
//     console.log('当前图表数据:', currentData); // 确保数据存在
  
//     if (!currentData) return;
  
//     // 生成 X 轴的标签名称
//     const labels = Object.keys(currentData)
//       .filter(key => key.endsWith('_extral'))
//       .map(key => key.replace('_extral', ''));
  
//     console.log('X轴标签:', labels);
  
//     // 提取 extral 和 insider 的数据
//     const extralData = labels.map(label => currentData[`${label}_extral`]);
//     const insiderData = labels.map(label => currentData[`${label}_insider`]);
  
//     console.log('Extral数据:', extralData);
//     console.log('Insider数据:', insiderData);
//       // 计算 extralData 和 insiderData 的总和
//     const extralData_sum = extralData.reduce((sum, value) => sum + (value || 0), 0);
//     const insiderData_sum = insiderData.reduce((sum, value) => sum + (value || 0), 0);

//     console.log('Extral数据总和:', extralData_sum);
//     console.log('Insider数据总和:', insiderData_sum);
    
  
//     const chart = echarts.init(document.getElementById('mainMap2'));
  
//     chart.setOption({
//       title: {
//         show: true,
//         // text: '图表标题', // 这里可以根据需要修改标题
//         x: 'center',
//         textStyle: {
//           fontSize: 20,
//           color: '#01c4f7', // 与 updateChart2 一致
//         }
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: function (params) {
//           let tooltipText = '';
//           params.forEach(item => {
//             tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
//           });
//           return tooltipText;
//         }
//       },
//       legend: {
//         data: ['Extral', 'Insider'],
//         textStyle: {
//           fontSize: 10, // 缩小图例字体大小
//           color: '#ffffff'
//         },
//         orient: 'vertical',  // 设置图例为垂直方向
//         right: 10,           // 将图例放置在右侧
//         top: 20,             // 将图例放置在顶部
//         itemWidth: 16,       // 缩小图例项的宽度
//         itemHeight: 10,      // 缩小图例项的高度
//         itemGap: 8           // 缩小图例项的间隔
//       },
//       grid: {
//         left: '10%',
//         right: '5%',
//         bottom: '20%', // 统一底部空间
//         top: '10%'
//       },
//       xAxis: {
//         type: 'category',
//         data: labels,
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           },
//           rotate: 45, // 如果标签过长，考虑旋转标签
//           interval: 0 // 确保所有标签都显示
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       yAxis: {
//         type: 'value',
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           }
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Extral',
//           type: 'bar',
//           data: extralData,
//           itemStyle: {
//             color: '#9702fe',
//           }
//         },
//         {
//           name: 'Insider',
//           type: 'bar',
//           data: insiderData,
//           itemStyle: {
//             color: '#ff893b',
//           }
//         }
//       ],
//     });
//   };
  

//   updateChart2 = () => {
//     const { totalData } = this.state;

//     // 过滤掉无效数据
//     const validData = totalData.filter(row => row.label_name !== null);

//     // 处理数据
//     const labels = validData.map(row => row.label_name);
//     const totalExtral = validData.map(row => row.total_extral);
//     const totalInside = validData.map(row => row.total_inside);

//     const chart = echarts.init(document.getElementById('mainMap3'));

//     chart.setOption({
//       title: {
//         show: true,
//         x: 'center',
//         textStyle: {
//           fontSize: 20,
//           color: '#01c4f7'
//         }
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: function (params) {
//           let tooltipText = '';
//           params.forEach(item => {
//             tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
//           });
//           return tooltipText;
//         }
//       },
//       legend: {
//         data: ['Extral', 'Insider'],
//         textStyle: {
//           fontSize: 12,
//           color: '#ffffff'
//         },
//         top: '10%',
//         right: '10%',
//         orient: 'vertical',
//         itemWidth: 20,
//         itemHeight: 12,
//         itemGap: 10
//       },
//       grid: {
//         left: '3%',
//         right: '15%',
//         bottom: '15%',
//         containLabel: true
//       },
//       xAxis: {
//         type: 'category',
//         data: labels,
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           },
//           rotate: 45, // 如果标签过长，考虑旋转标签
//           interval: 0 // 确保所有标签都显示
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
      
//       yAxis: {
//         type: 'value',
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           }
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Extral',
//           type: 'bar',
//           data: totalExtral,
//           itemStyle: {
//             color: '#9702fe',
//           }
//         },
//         {
//           name: 'Insider',
//           type: 'bar',
//           data: totalInside,
//           itemStyle: {
//             color: '#ff893b',
//           }
//         }
//       ],
//       dataZoom: [
//         {
//           type: 'inside'
//         },
//         {
//           type: 'slider',
//           height: 10, // 调整滑块的高度
//           // bottom: 0 // 将滑块放在图表的底部，避免遮挡数据
//         }
//       ]
//     });
//   };
  
//   componentDidUpdate(prevProps, prevState) {
//     // 如果索引发生变化，更新图表
//     if (prevState.currentImageIndex1 !== this.state.currentImageIndex1 || 
//         prevState.currentImageIndex2 !== this.state.currentImageIndex2) {
//       this.updateChart1();
//       this.fetchDataAndUpdateChart();
//       // this.updateChart2();
//     }
//   }

// // 获取轮播图和线粒体健康状况pie图
//   fetchDataAndUpdateChart() {
//     const { currentImageIndex, imageFiles } = this.state;
//     if (!imageFiles || imageFiles.length === 0) return;
    
//     const currentImagePath = imageFiles[currentImageIndex];
//     console.log("****currentImagePath", currentImagePath);
    
//     // Normalize path separators (just in case)
//     const normalizedPath = currentImagePath.replace(/\\/g, '/');
    
//     // Extract filename
//     const filenameWithExtension = normalizedPath.split('/').pop();
    
//     // Remove file extension
//     const filenameWithoutExtension = filenameWithExtension.split('.').slice(0, -1).join('.');
    
//     console.log("Filename without extension:", filenameWithoutExtension);
//     const newFilePath = `/free/class_predict/${filenameWithoutExtension}.txt`;
//     console.log("New file path:", newFilePath);
    
//     fetch(newFilePath)
//       .then(response => response.text())
//       .then(text => {
//         const classAllMatch = text.match(/class_all:\s*\[(.*?)\]/);
//         const cntAllMatch = text.match(/cnt_all:\s*\[(.*?)\]/);
        
//         if (classAllMatch && cntAllMatch) {
//           const class_all = classAllMatch[1].split(/\s+/).map(Number);
//           const cnt_all = cntAllMatch[1].split(/\s+/).map(Number);
          
//           // Process the data
//           this.updateTopData(class_all);
//           this.updateChart(cnt_all)
//         }
//       })
//       .catch(error => console.error('Error fetching data:', error));
//   }
  
//   updateTopData(class_all) {
//     const topdata = {
//         data: class_all.map((value, index) => ({
//             name: `mitochondrion ${index + 1}`,
//             value: value === 0 ? '健康' : '不健康'
//         })),
//         carousel: 'page',
//         scrollSpeed: 5
//     };

//     this.setState({ topdata });
//     console.log("更新后的 topdata:", topdata);
// }


//   handleSliderChange = (event) => {
//     const newIndex = parseInt(event.target.value, 10);
//     this.setState({
//       currentImageIndex1: newIndex,
//       currentImageIndex2: newIndex,
//     });
//   };

//   handleResize = () => {
//     const { myChart1, myChart2, myChart3, myChart4, myChart5, myChart6 } = this.state;
//     [myChart1, myChart2, myChart3, myChart4, myChart5, myChart6].forEach(chart => {
//       if (chart) chart.resize();
//     });
//   };


//   initializeCharts = () => {
//     if (
//       document.getElementById('mainMap2') && document.getElementById('mainMap3')) {
//       this.fetchDataAndUpdateChart();
//       // this.initialECharts4();
//       // this.initialECharts5();
//     } else {
//       console.error('必要的 DOM 元素未加载');
//     }
//   };
//     // ------------------------------------------------------------
  
//   initialECharts = () => {
//     echarts.registerMap('zhongguo', geoJson)
//     const flyGeo = {
//       洛阳: [112.460299, 34.62677]
//     }

//     //飞线数据
//     const flyVal = [
//       [{ name: '洛阳' }, { name: '洛阳', value: 100 }]
//     ]
//     const convertFlyData = function(data) {
//       let res = []
//       for (let i = 0; i < data.length; i++) {
//         let dataItem = data[i]
//         let toCoord = flyGeo[dataItem[0].name]
//         let fromCoord = flyGeo[dataItem[1].name]
//         if (fromCoord && toCoord) {
//           res.push({
//             fromName: dataItem[1].name,
//             toName: dataItem[0].name,
//             coords: [fromCoord, toCoord]
//           })
//         }
//       }
//       return res
//     }
//     //报表配置
//     const originName = '浙江'
//     const flySeries = []
//     ;[[originName, flyVal]].forEach(function(item, i) {
//       flySeries.push(
//         {
//           name: item[0],
//           type: 'lines',
//           zlevel: 1,
//           symbol: ['none', 'none'],
//           symbolSize: 0,
//           effect: {
//             //特效线配置
//             show: true,
//             period: 5, //特效动画时间，单位s
//             trailLength: 0.1, //特效尾迹的长度，从0到1
//             symbol: 'arrow',
//             symbolSize: 5
//           },
//           lineStyle: {
//             normal: {
//               color: '#f19000',
//               width: 1,
//               opacity: 0.6,
//               curveness: 0.2 //线的平滑度
//             }
//           },
//           data: convertFlyData(item[1])
//         },
//         {
//           name: item[0],
//           type: 'effectScatter',
//           coordinateSystem: 'geo',
//           zlevel: 2,
//           rippleEffect: {
//             //涟漪特效
//             period: 5, //特效动画时长
//             scale: 4, //波纹的最大缩放比例
//             brushType: 'stroke' //波纹的绘制方式：stroke | fill
//           },
//           label: {
//             normal: {
//               show: false,
//               position: 'right',
//               formatter: '{b}'
//             }
//           },
//           symbol: 'circle',
//           symbolSize: function(val) {
//             //根据某项数据值设置符号大小
//             return val[2] / 10
//           },
//           itemStyle: {
//             normal: {
//               color: '#f19000'
//             }
//           },
//           data: item[1].map(function(dataItem) {
//             return {
//               name: dataItem[1].name,
//               value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
//             }
//           })
//         },
//         {
//           //与上层的点叠加
//           name: item[0],
//           type: 'scatter',
//           coordinateSystem: 'geo',
//           zlevel: 3,
//           symbol: 'circle',
//           symbolSize: function(val) {
//             //根据某项数据值设置符号大小
//             return val[2] / 15
//           },
//           itemStyle: {
//             normal: {
//               color: '#f00'
//             }
//           },
//           data: item[1].map(function(dataItem) {
//             return {
//               name: dataItem[1].name,
//               value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
//             }
//           })
//         }
//       )
//     })

//     this.setState(
//       { myChart1: echarts.init(document.getElementById('mainMap')) },
//       () => {
//         this.state.myChart1.setOption({
//           tooltip: {
//             trigger: 'item'
//           },
//         })
//       }
//     )
//   }

//   render() {
//     const { tooltipStyle, labelValue, labelData  } = this.state;
//     // const { imageFiles, currentImageIndex, topdata, tabledata } = this.state;
//     // const currentImage = imageFiles.length > 0 ? imageFiles[currentImageIndex] : null;

//     const { imageFiles1, currentImageIndex1, topdata, tabledata, tableData2, imageFiles2, currentImageIndex2 } = this.state;
  
//     // console.log('Current image index:', currentImageIndex);
//     // console.log('Image files:', imageFiles);
//     const currentImage1 = imageFiles1 && imageFiles1.length > 0 
//         ? imageFiles1[currentImageIndex1] 
//         : null;
//     // console.log('&&&&Current image:', currentImage1);

//     const currentImage2 = imageFiles2 && imageFiles2.length > 0 
//     ? imageFiles2[currentImageIndex2] 
//     : null;
//     // console.log('&&&&Current image:', currentImage2);

//     console.log("", topdata)
//     console.log('tableData2:', tableData2);
//     console.log('tabledata:', tabledata);




//     return (
//       <div className="data">
//         <BackButton />
//         <header className="header_main">
//           <div className="left_bg"></div>
//           <div className="right_bg"></div>
//           <h3>可视化</h3>
//         </header>
//         <div className="wrapper">
//           <div className="container-fluid">
//             {/* <div className="row fill-h0" style={{ display: 'flex' }}>
//             </div> */}
//             {/* 上半部分，占整个页面的2/3高度 */}
//             <div className="row fill-h" style={{ display: 'flex' }}>
//               {/* 左侧1/4部分，mainMap1 */}
//               <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
//                 <div className="xpanel-wrapper xpanel-wrapper-5">
//                   <BorderBox1>
//                     <div className="content_title">数据统计</div>
//                     <table>
//                       <thead>
//                         <tr>
//                           <th>图片名称</th>
//                           <th>Extral Sum</th>
//                           <th>Insider Sum</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {this.state.tableData2.length > 0 && this.state.tableData2.map((row, index) => (
//                           <tr key={index}>
//                             <td>{row.images_name || 'No Data'}</td>
//                             <td>{row.extralData_sum || 0}</td>
//                             <td>{row.insiderData_sum || 0}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </BorderBox1>
//                 </div>
//               </div>
    
//               {/* 中间部分，占2/4，即50% */}
//               <div className="col-lg-6 fill-h" style={{ width: '50%' }}>
//                 <div className="xpanel-wrapper xpanel-wrapper-5">
//                   <div className="xpanel" style={{ position: 'relative' }}>
//                     {currentImage1 ? (
//                       <div className="class_images">
//                         <div>
//                           <img
//                             src={imageFiles2[currentImageIndex2]}
//                             alt={`Image ${currentImageIndex2}`}
//                             style={{ width: '100%', height: 'auto' }}
//                           />
//                         </div>
//                         {/* <div className="source_images">
//                           <img
//                             src={imageFiles1[currentImageIndex1]}
//                             alt={`Image ${currentImageIndex1}`}
//                             style={{ width: '100%', height: 'auto' }}
//                           />
//                         </div> */}
//                         <div className="source_images" onMouseMove={this.handleMouseMove} onClick={this.handleClick}>
//                           <img
//                             src={imageFiles1[currentImageIndex1]}
//                             alt={`Image ${currentImageIndex1}`}
//                             style={{ width: '100%', height: 'auto' }}
//                           />
//                           <div
//                             style={tooltipStyle}
//                             className="tooltip"
//                           >
//                             {labelValue !== null ? `Label: ${labelValue}` : '点击图片获取标签'}
//                           </div>
//                         </div>
//                         <input
//                           type="range"
//                           min="0"
//                           max={imageFiles1.length - 1}
//                           value={currentImageIndex1}
//                           onChange={this.handleSliderChange}
//                           style={{ width: '100%' }}
//                         />
//                       </div>
//                     ) : (
//                       <div>正在加载图片...</div>
//                     )}
//                     <div style={{ height: 60, width: 200, position: 'absolute', top: 20, right: 20 }}>
//                       <Decoration1 style={{ width: '100%', height: '100%' }} />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* 右侧1/4部分 */}
//               <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
//                 <div className="xpanel-wrapper xpanel-wrapper-6" style={{ position: 'relative' }}>
//                   <div className="content_title">线粒体状况占比</div>
//                     <BorderBox1>
//                       <div className="xpanel">
//                         <div className="fill-h2">
//                           {labelValue !== null ? (
//                             <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
//                               <table style={{ borderCollapse: 'collapse', width: 'auto', border: 'none', fontFamily: 'Arial, sans-serif' }}>
//                                 <thead>
//                                   <tr>
//                                     <th style={{ border: 'none', padding: '8px', textAlign: 'left' }}>Label</th>
//                                     <th style={{ border: 'none', padding: '8px', textAlign: 'left' }}>Extral</th>
//                                     <th style={{ border: 'none', padding: '8px', textAlign: 'left' }}>Insider</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   <tr>
//                                     <td style={{ border: 'none', padding: '8px' }}>{labelValue}</td>
//                                     <td style={{ border: 'none', padding: '8px' }}>
//                                       {labelData && !isNaN(labelData.extral) ? Number(labelData.extral).toFixed(3) : '无数据'}
//                                     </td>
//                                     <td style={{ border: 'none', padding: '8px' }}>
//                                       {labelData && !isNaN(labelData.insider) ? Number(labelData.insider).toFixed(3) : '无数据'}
//                                     </td>
//                                   </tr>
//                                 </tbody>
//                               </table>
//                             </div>
//                           ) : ''}
//                         </div>
//                       </div>
//                     </BorderBox1>
//                 </div>
//               </div>
//             </div>
    
//             <div className="row fill-h0" style={{display: 'flex' }}>
//             </div>

//             {/* 下半部分，占整个页面的1/3高度 */}
//             <div className="row fill-h1" style={{display: 'flex' }}>
//               {/* 左侧1/2部分，mainMap2 */}
//               <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
//                 <BorderBox8>
//                   <div className="xpanel2">
//                     {/* <div className="fill-h" id="mainMap2"></div> */}
//                     <div className="fill-h" id="mainMap2"></div>
//                   </div>
//                 </BorderBox8>
//               </div>
    
//               {/* 右侧1/2部分，mainMap3 */}
//               <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
//                 <BorderBox8>
//                   <div className="xpanel2">
//                     <div className="fill-h" id="mainMap3"></div>
//                   </div>
//                 </BorderBox8>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );   
//   }
//   }

  // export default App;



  // **************************************
  // **************************************
  // 2024.8.29   鼠标悬浮显示线粒体编号未实现
// import React, { Component } from 'react'
// import * as echarts from 'echarts';
// import geoJson from './map/china.json'
// import { BorderBox1 ,BorderBox8 ,BorderBox13,Decoration1 ,ScrollBoard,ScrollRankingBoard } from '@jiaminghi/data-view-react'
// import './index2.css'
// import { useNavigate } from 'react-router-dom';
// import { Button } from 'antd';
// import Papa from 'papaparse';
// import npyjs from 'npyjs';


// function BackButton() {
//   const navigate = useNavigate();
//   return (
//     <Button 
//       type="primary" 
//       style={{ position: 'absolute', top: '15px', left: '70px', zIndex: 1000 }}
//       onClick={() => navigate(-1)}
//     >
//       返回
//     </Button>
//   );
// }

// class App extends Component {
  

//   state = {
//     chartData: [],
//     labelData: null, // 当前标签对应的数据
//     totalData: [],
//     imageFiles1: [],
//     currentImageIndex1: 0,
//     imageFiles2: [],
//     currentImageIndex2: 0,
//     topdata: {},
//     tabledata: {},
//     tableData2: [], 
//     labelValue: null, // 当前线粒体标签值
//     tooltipStyle: { display: 'none', position: 'absolute', top: 0, left: 0 },
//   };
  
//   async componentDidMount() {
//     try {
//       await Promise.all([this.loadImages1(), this.loadImages2(), this.loadCSVSingle(), this.loadCSVTotal()]);
//       this.initializeCharts();
//     } catch (error) {
//       console.error('Error during component mount:', error);
//     }

//     window.addEventListener('resize', this.handleResize);
//   }

//   componentWillUnmount() {
//     window.removeEventListener('resize', this.handleResize);
//   }

//   async loadCSVSingle() {
//     try {
//       const response = await fetch('/free/outputs/single_info.csv');
//       const csvData = await response.text();
//       Papa.parse(csvData, {
//         header: true,
//         dynamicTyping: true,
//         complete: (result) => {
//           this.setState({ chartData: result.data }, this.updateChart1);
//         },
//         error: (error) => console.error('解析CSV文件出错:', error),
//       });
//     } catch (error) {
//       console.error('Error fetching single CSV:', error);
//     }
//   }

//   async loadCSVTotal() {
//     try {
//       const response = await fetch('/free/outputs/total_info.csv');
//       const csvData = await response.text();
//       Papa.parse(csvData, {
//         header: true,
//         dynamicTyping: true,
//         complete: (result) => {
//           this.setState({ totalData: result.data }, this.updateChart2);
//         },
//         error: (error) => console.error('解析CSV文件出错:', error),
//       });
//     } catch (error) {
//       console.error('Error fetching total CSV:', error);
//     }
//   }
//   async loadImages1() {
//     try {
//       const response = await fetch('/free/outputs/seg.json');
//       // const response = await fetch('/free/seg/png_paths.json');
//       if (!response.ok) throw new Error('Network response was not ok');
//       const imagePaths1 = await response.json();
//       this.setState({ imageFiles1: imagePaths1, currentImageIndex1: 0 });
//     } catch (error) {
//       console.error('Error loading image paths:', error);
//     }
//   }

//   async loadImages2() {
//     try { 
//       // const response = await fetch('/free/seg_source/source_paths.json');
//       const response = await fetch('/free/seg/png_paths.json');
//       if (!response.ok) throw new Error('Network response was not ok');
//       const imagePaths2 = await response.json();
//       this.setState({ imageFiles2: imagePaths2, currentImageIndex2: 0 });
//     } catch (error) {
//       console.error('Error loading source image paths:', error);
//     }
//   }

//   async fetchLabelFromNpy(x, y) {
//     try {
//       const imageName = this.state.imageFiles1[this.state.currentImageIndex1];
//       if (!imageName) throw new Error('当前图像文件名未定义');
  
//       const fileName = imageName.split('/').pop().replace(/\.[^/.]+$/, '');
//       const filePath = `/free/outputs/${fileName}.npy`;
//       const npy = new npyjs();
  
//       const response = await fetch(filePath);
//       const buffer = await response.arrayBuffer();
//       const npyData = await npy.load(buffer);
  
//       if (!npyData || !npyData.data) throw new Error('npyData 或 npyData.data 不存在');
  
//       const width = 800;
//       const height = 800;
  
//       const index = y * width + x;
//       if (index < 0 || index >= npyData.data.length) {
//         console.error('索引超出数据范围:', index);
//         return null;
//       }
  
//       return npyData.data[index];
//     } catch (error) {
//       console.error('获取 npy 文件出错:', error);
//       return null;
//     }
//   }
  
  

//   handleMouseMove = async (event) => {
//     const img = event.currentTarget.querySelector('img');
//     const rect = img.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
  
//     // 计算缩放比例
//     const scaleX = img.naturalWidth / img.width;
//     const scaleY = img.naturalHeight / img.height;
  
//     // 缩放坐标
//     const xIndex = Math.floor(x * scaleX);
//     const yIndex = Math.floor(y * scaleY);
  
//     try {
//       // 获取标签值
//       const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);
  
//       this.setState({
//         tooltipStyle: {
//           display: 'block',
//           top: event.clientY + 15 + 'px',  // 增加单位
//           left: event.clientX + 15 + 'px', // 增加单位
//         },
//         tooltipContent: labelValue !== null ? `线粒体编号: ${labelValue}` : '无标签',
//       });
//     } catch (error) {
//       console.error('获取标签值时出错:', error);
//       this.setState({
//         tooltipStyle: {
//           display: 'none',
//         },
//         tooltipContent: '',
//       });
//     }
//   }
  
  
//   handleMouseLeave = () => {
//     this.setState({
//       tooltipStyle: {
//         display: 'none',
//       },
//       tooltipContent: '',
//     });
//   }

  

//   async fetchDataForLabel() {
//     const { chartData, labelValue, imageFiles1, currentImageIndex1 } = this.state;
//     if (chartData.length === 0) return;
    
//     let currentData = null;

//     try {
//       // Getting the current image URL
//       const imageUrl = imageFiles1[currentImageIndex1];
//       if (!imageUrl) throw new Error('当前图像文件名未定义');

//       // Extracting the filename from the URL.
//       const fileName = imageUrl.split('/').pop().replace(/\.[^/.]+$/, '') + '.png';
      
//       // Searching the data row corresponding to the image.
//       const dataRow = chartData.find(data => data.image_name === fileName);
//       if (dataRow) {
//         if (labelValue === 0) {
//           // Display all data if the label is 0
//           currentData = { ...dataRow };
//         } else {
//           // For labels 1 to 14, extract the corresponding extral and insider data
//           currentData = {
//             extral: dataRow[`label_${labelValue}_extral`],
//             insider: dataRow[`label_${labelValue}_insider`]
//           };
//         }
//       } else {
//         console.error('未找到对应图像的数据:', fileName);
//       }
//     } catch (error) {
//       console.error('获取标签数据时出错:', error);
//     }

//     // Calculate the sum of extralData and insiderData
//     const extralSum = (currentData?.extral || []).reduce((sum, value) => sum + (value || 0), 0);
//     const insiderSum = (currentData?.insider || []).reduce((sum, value) => sum + (value || 0), 0);

//     // For debugging: log the calculated sums and new table data
//     console.log('Extral Sum:', extralSum);
//     console.log('Insider Sum:', insiderSum);
//     console.log('Image Name:', imageFiles1[currentImageIndex1]);

//     this.setState({ 
//       labelData: currentData,
//       tableData2: [{ 
//         images_name: imageFiles1[currentImageIndex1], 
//         extralData_sum: extralSum, 
//         insiderData_sum: insiderSum 
//       }]
//     });
//   };
  
  
  
  
//   handleClick = async (event) => {
//     const img = event.currentTarget.querySelector('img'); // 获取图片元素
//     const rect = img.getBoundingClientRect(); // 获取图片的边界矩形
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
  
//     // 计算缩放比例
//     const scaleX = img.naturalWidth / img.width;
//     const scaleY = img.naturalHeight / img.height;
  
//     // 缩放坐标
//     const xIndex = Math.floor(x * scaleX);
//     const yIndex = Math.floor(y * scaleY);
  
//     const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);
    
//     this.setState({
//       labelValue,
//       labelData: {
//         extral: labelValue !== null ? `Extral for ${labelValue}` : '无标签', // Replace with your logic
//         insider: labelValue !== null ? `Insider for ${labelValue}` : '无标签' // Replace with your logic
//       }
//     });
//   }
  
//   handleMouseLeave = () => {
//     this.setState({
//       tooltipStyle: {
//         display: 'none',
//       },
//       tooltipContent: '',
//     });
//   }

  
//   updateChart1 = () => {
//     const svgElement = document.querySelector('svg[width="200px"][height="50px"]');

//     // 如果找到，则删除该元素
//     if (svgElement) {
//         svgElement.remove();
//     }
//     const { chartData, currentImageIndex1 } = this.state;
//     const currentData = chartData[currentImageIndex1];
  
//     console.log('当前图表数据:', currentData); // 确保数据存在
  
//     if (!currentData) return;
  
//     // 生成 X 轴的标签名称
//     const labels = Object.keys(currentData)
//       .filter(key => key.endsWith('_extral'))
//       .map(key => key.replace('_extral', ''));
  
//     console.log('X轴标签:', labels);
  
//     // 提取 extral 和 insider 的数据
//     const extralData = labels.map(label => currentData[`${label}_extral`]);
//     const insiderData = labels.map(label => currentData[`${label}_insider`]);
  
//     console.log('Extral数据:', extralData);
//     console.log('Insider数据:', insiderData);
//       // 计算 extralData 和 insiderData 的总和
//     const extralData_sum = extralData.reduce((sum, value) => sum + (value || 0), 0);
//     const insiderData_sum = insiderData.reduce((sum, value) => sum + (value || 0), 0);

//     console.log('Extral数据总和:', extralData_sum);
//     console.log('Insider数据总和:', insiderData_sum);
//     this.setState({
//       currentLabels: labels,
//       currentExtralData: extralData,
//       currentInsiderData: insiderData,
//       currentExtralSum: extralData_sum,
//       currentInsiderSum: insiderData_sum
//     });
    
    
  
//     const chart = echarts.init(document.getElementById('mainMap2'));
  
//     chart.setOption({
//       title: {
//         show: true,
//         // text: '图表标题', // 这里可以根据需要修改标题
//         x: 'center',
//         textStyle: {
//           fontSize: 20,
//           color: '#01c4f7', // 与 updateChart2 一致
//         }
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: function (params) {
//           let tooltipText = '';
//           params.forEach(item => {
//             tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
//           });
//           return tooltipText;
//         }
//       },
//       legend: {
//         data: ['Extral', 'Insider'],
//         textStyle: {
//           fontSize: 10, // 缩小图例字体大小
//           color: '#ffffff'
//         },
//         orient: 'vertical',  // 设置图例为垂直方向
//         right: 10,           // 将图例放置在右侧
//         top: 20,             // 将图例放置在顶部
//         itemWidth: 16,       // 缩小图例项的宽度
//         itemHeight: 10,      // 缩小图例项的高度
//         itemGap: 8           // 缩小图例项的间隔
//       },
//       grid: {
//         left: '10%',
//         right: '5%',
//         bottom: '20%', // 统一底部空间
//         top: '10%'
//       },
//       xAxis: {
//         type: 'category',
//         data: labels,
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           },
//           rotate: 45, // 如果标签过长，考虑旋转标签
//           interval: 0 // 确保所有标签都显示
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       yAxis: {
//         type: 'value',
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           }
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Extral',
//           type: 'bar',
//           data: extralData,
//           itemStyle: {
//             color: '#9702fe',
//           }
//         },
//         {
//           name: 'Insider',
//           type: 'bar',
//           data: insiderData,
//           itemStyle: {
//             color: '#ff893b',
//           }
//         }
//       ],
//     });
//   };
  

//   updateChart2 = () => {
//     const { totalData } = this.state;

//     // 过滤掉无效数据
//     const validData = totalData.filter(row => row.label_name !== null);

//     // 处理数据
//     const labels = validData.map(row => row.label_name);
//     const totalExtral = validData.map(row => row.total_extral);
//     const totalInside = validData.map(row => row.total_inside);

//     const chart = echarts.init(document.getElementById('mainMap3'));

//     chart.setOption({
//       title: {
//         show: true,
//         x: 'center',
//         textStyle: {
//           fontSize: 20,
//           color: '#01c4f7'
//         }
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: function (params) {
//           let tooltipText = '';
//           params.forEach(item => {
//             tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
//           });
//           return tooltipText;
//         }
//       },
//       legend: {
//         data: ['Extral', 'Insider'],
//         textStyle: {
//           fontSize: 12,
//           color: '#ffffff'
//         },
//         top: '10%',
//         right: '10%',
//         orient: 'vertical',
//         itemWidth: 20,
//         itemHeight: 12,
//         itemGap: 10
//       },
//       grid: {
//         left: '3%',
//         right: '15%',
//         bottom: '15%',
//         containLabel: true
//       },
//       xAxis: {
//         type: 'category',
//         data: labels,
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           },
//           rotate: 45, // 如果标签过长，考虑旋转标签
//           interval: 0 // 确保所有标签都显示
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
      
//       yAxis: {
//         type: 'value',
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           }
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Extral',
//           type: 'bar',
//           data: totalExtral,
//           itemStyle: {
//             color: '#9702fe',
//           }
//         },
//         {
//           name: 'Insider',
//           type: 'bar',
//           data: totalInside,
//           itemStyle: {
//             color: '#ff893b',
//           }
//         }
//       ],
//       dataZoom: [
//         {
//           type: 'inside'
//         },
//         {
//           type: 'slider',
//           height: 10, // 调整滑块的高度
//           // bottom: 0 // 将滑块放在图表的底部，避免遮挡数据
//         }
//       ]
//     });
//   };
  
//   componentDidUpdate(prevProps, prevState) {
//     // 如果索引发生变化，更新图表
//     if (prevState.currentImageIndex1 !== this.state.currentImageIndex1 || 
//         prevState.currentImageIndex2 !== this.state.currentImageIndex2) {
//       this.updateChart1();
//       this.fetchDataAndUpdateChart();
//       // this.updateChart2();
//     }
//   }

// // 获取轮播图和线粒体健康状况pie图
//   fetchDataAndUpdateChart() {
//     const { currentImageIndex, imageFiles } = this.state;
//     if (!imageFiles || imageFiles.length === 0) return;
    
//     const currentImagePath = imageFiles[currentImageIndex];
//     console.log("****currentImagePath", currentImagePath);
    
//     // Normalize path separators (just in case)
//     const normalizedPath = currentImagePath.replace(/\\/g, '/');
    
//     // Extract filename
//     const filenameWithExtension = normalizedPath.split('/').pop();
    
//     // Remove file extension
//     const filenameWithoutExtension = filenameWithExtension.split('.').slice(0, -1).join('.');
    
//     console.log("Filename without extension:", filenameWithoutExtension);
//     const newFilePath = `/free/class_predict/${filenameWithoutExtension}.txt`;
//     console.log("New file path:", newFilePath);
    
//     fetch(newFilePath)
//       .then(response => response.text())
//       .then(text => {
//         const classAllMatch = text.match(/class_all:\s*\[(.*?)\]/);
//         const cntAllMatch = text.match(/cnt_all:\s*\[(.*?)\]/);
        
//         if (classAllMatch && cntAllMatch) {
//           const class_all = classAllMatch[1].split(/\s+/).map(Number);
//           const cnt_all = cntAllMatch[1].split(/\s+/).map(Number);
          
//           // Process the data
//           this.updateTopData(class_all);
//           this.updateChart(cnt_all)
//         }
//       })
//       .catch(error => console.error('Error fetching data:', error));
//   }
  
//   updateTopData(class_all) {
//     const topdata = {
//         data: class_all.map((value, index) => ({
//             name: `mitochondrion ${index + 1}`,
//             value: value === 0 ? '健康' : '不健康'
//         })),
//         carousel: 'page',
//         scrollSpeed: 5
//     };

//     this.setState({ topdata });
//     console.log("更新后的 topdata:", topdata);
// }


//   handleSliderChange = (event) => {
//     const newIndex = parseInt(event.target.value, 10);
//     this.setState({
//       currentImageIndex1: newIndex,
//       currentImageIndex2: newIndex,
//     });
//   };

//   handleResize = () => {
//     const { myChart1, myChart2, myChart3, myChart4, myChart5, myChart6 } = this.state;
//     [myChart1, myChart2, myChart3, myChart4, myChart5, myChart6].forEach(chart => {
//       if (chart) chart.resize();
//     });
//   };


//   initializeCharts = () => {
//     if (
//       document.getElementById('mainMap2') && document.getElementById('mainMap3')) {
//       this.fetchDataAndUpdateChart();
//       // this.initialECharts4();
//       // this.initialECharts5();
//     } else {
//       console.error('必要的 DOM 元素未加载');
//     }
//   };
//     // ------------------------------------------------------------
  
//   initialECharts = () => {
//     echarts.registerMap('zhongguo', geoJson)
//     const flyGeo = {
//       洛阳: [112.460299, 34.62677]
//     }

//     //飞线数据
//     const flyVal = [
//       [{ name: '洛阳' }, { name: '洛阳', value: 100 }]
//     ]
//     const convertFlyData = function(data) {
//       let res = []
//       for (let i = 0; i < data.length; i++) {
//         let dataItem = data[i]
//         let toCoord = flyGeo[dataItem[0].name]
//         let fromCoord = flyGeo[dataItem[1].name]
//         if (fromCoord && toCoord) {
//           res.push({
//             fromName: dataItem[1].name,
//             toName: dataItem[0].name,
//             coords: [fromCoord, toCoord]
//           })
//         }
//       }
//       return res
//     }
//     //报表配置
//     const originName = '浙江'
//     const flySeries = []
//     ;[[originName, flyVal]].forEach(function(item, i) {
//       flySeries.push(
//         {
//           name: item[0],
//           type: 'lines',
//           zlevel: 1,
//           symbol: ['none', 'none'],
//           symbolSize: 0,
//           effect: {
//             //特效线配置
//             show: true,
//             period: 5, //特效动画时间，单位s
//             trailLength: 0.1, //特效尾迹的长度，从0到1
//             symbol: 'arrow',
//             symbolSize: 5
//           },
//           lineStyle: {
//             normal: {
//               color: '#f19000',
//               width: 1,
//               opacity: 0.6,
//               curveness: 0.2 //线的平滑度
//             }
//           },
//           data: convertFlyData(item[1])
//         },
//         {
//           name: item[0],
//           type: 'effectScatter',
//           coordinateSystem: 'geo',
//           zlevel: 2,
//           rippleEffect: {
//             //涟漪特效
//             period: 5, //特效动画时长
//             scale: 4, //波纹的最大缩放比例
//             brushType: 'stroke' //波纹的绘制方式：stroke | fill
//           },
//           label: {
//             normal: {
//               show: false,
//               position: 'right',
//               formatter: '{b}'
//             }
//           },
//           symbol: 'circle',
//           symbolSize: function(val) {
//             //根据某项数据值设置符号大小
//             return val[2] / 10
//           },
//           itemStyle: {
//             normal: {
//               color: '#f19000'
//             }
//           },
//           data: item[1].map(function(dataItem) {
//             return {
//               name: dataItem[1].name,
//               value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
//             }
//           })
//         },
//         {
//           //与上层的点叠加
//           name: item[0],
//           type: 'scatter',
//           coordinateSystem: 'geo',
//           zlevel: 3,
//           symbol: 'circle',
//           symbolSize: function(val) {
//             //根据某项数据值设置符号大小
//             return val[2] / 15
//           },
//           itemStyle: {
//             normal: {
//               color: '#f00'
//             }
//           },
//           data: item[1].map(function(dataItem) {
//             return {
//               name: dataItem[1].name,
//               value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
//             }
//           })
//         }
//       )
//     })

//     this.setState(
//       { myChart1: echarts.init(document.getElementById('mainMap')) },
//       () => {
//         this.state.myChart1.setOption({
//           tooltip: {
//             trigger: 'item'
//           },
//         })
//       }
//     )
//   }

//   render() {
//     const {
//       tooltipStyle,
//       tooltipContent,
//       labelValue,
//       labelData,
//       imageFiles1,
//       currentImageIndex1,
//       imageFiles2,
//       currentImageIndex2,
//       currentExtralSum,
//       currentInsiderSum,
//       currentExtralData,
//       currentInsiderData
//     } = this.state;
  
//     const currentImage1 = imageFiles1 && imageFiles1.length > 0 ? imageFiles1[currentImageIndex1] : null;
  
//     const containerStyle = {
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       height: '80%',
//       marginTop: '20px',
//     };
  
//     const tableStyle = {
//       margin: '0 auto',
//       borderCollapse: 'collapse',
//       fontSize: '18px',
//       textAlign: 'center',
//       marginTop: '40px',
//     };
  
//     const thStyle = {
//       border: '1px solid #dddddd',
//       padding: '8px',
//       backgroundColor: '#333',
//       color: 'white',
//     };
  
//     const tdStyle = {
//       border: '1px solid #dddddd',
//       padding: '8px',
//     };
  
//     const tooltipDefaultStyle = {
//       position: 'absolute',
//       backgroundColor: '#333',
//       color: '#fff',
//       padding: '5px',
//       borderRadius: '3px',
//       pointerEvents: 'none',
//       zIndex: 1000,
//     };


//     const containerStyle1 = {
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       height: '80%',
//       marginTop: '0px',
//     };
    
//     const tableStyle1 = {
//       width: '80%', // 增加表格宽度以使其更宽
//       margin: '0 auto',
//       borderCollapse: 'collapse',
//       fontSize: '18px',
//       textAlign: 'center',
//       marginTop: '25px',
//     };
    
//     const thStyle1 = {
//       border: '1px solid #dddddd',
//       padding: '8px',
//       backgroundColor: '#333',
//       color: 'white',
//     };
    
//     const tdStyle1 = {
//       border: '1px solid #dddddd',
//       padding: '8px',
//     };
    
//     const tooltipDefaultStyle1 = {
//       position: 'absolute',
//       backgroundColor: '#333',
//       color: '#fff',
//       padding: '5px',
//       borderRadius: '3px',
//       pointerEvents: 'none',
//       zIndex: 1000,
//     };
  
//     const formattedExtralSum = currentExtralSum ? currentExtralSum.toFixed(3) : '暂无数据';
//     const formattedInsiderSum = currentInsiderSum ? currentInsiderSum.toFixed(3) : '暂无数据';
  
//     return (
//       <div className="data">
//         <header className="header_main">
//           <div className="left_bg"></div>
//           <div className="right_bg"></div>
//           <h3>Data Visualization</h3>
//         </header>
//         <BackButton />
//         <div className="wrapper">
//           <div className="container-fluid">
//             <div className="row fill-h" style={{ display: 'flex' }}>
//               <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
//                 <div className="xpanel-wrapper xpanel-wrapper-5">
//                   <BorderBox1>
//                     <div className="content_title">数据统计</div>
//                     <div style={containerStyle}>
//                       <table style={tableStyle}>
//                         <thead>
//                           <tr>
//                             <th style={thStyle}>Extral Sum</th>
//                             <th style={thStyle}>Insider Sum</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td style={tdStyle}>{formattedExtralSum}</td>
//                             <td style={tdStyle}>{formattedInsiderSum}</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </BorderBox1>
//                 </div>
//               </div>
  
//               <div className="col-lg-6 fill-h" style={{ width: '50%' }}>
//                 <div className="xpanel-wrapper xpanel-wrapper-5">
//                   <div className="xpanel" style={{ position: 'relative' }}>
//                     {currentImage1 ? (
//                       <div className="class_images">
//                         <div>
//                           <img
//                             src={imageFiles2[currentImageIndex2]}
//                             alt={`Image ${currentImageIndex2}`}
//                             style={{ width: '100%', height: 'auto' }}
//                           />
//                         </div>
//                         <div
//                           className="source_images"
//                           onMouseMove={this.handleMouseMove}
//                           onMouseLeave={this.handleMouseLeave}
//                           onClick={this.handleClick}
//                         >
//                           <img
//                             src={imageFiles1[currentImageIndex1]}
//                             alt={`Image ${currentImageIndex1}`}
//                             style={{ width: '100%', height: 'auto' }}
//                           />
//                           <div
//                             style={{ ...tooltipDefaultStyle, ...tooltipStyle }} // 合并样式
//                             className="tooltip"
//                           >
//                             {tooltipContent}
//                           </div>
//                         </div>
//                         <input
//                           type="range"
//                           min="0"
//                           max={imageFiles1.length - 1}
//                           value={currentImageIndex1}
//                           onChange={this.handleSliderChange}
//                           style={{ width: '100%' }}
//                         />
//                       </div>
//                     ) : (
//                       <div>正在加载图片...</div>
//                     )}
//                     {/* <div style={{ height: 60, width: 200, position: 'absolute', bottom: 20, left: 20 }}>
//                       {labelValue !== null ? `标签值: ${labelValue}` : '点击获取标签'}
//                     </div> */}
//                     <div style={{ height: 60, width: 200, position: 'absolute', top: 20, right: 20 }}>
//                       <Decoration1 style={{ width: '100%', height: '100%' }} />
//                     </div>
//                   </div>
//                 </div>
//               </div>
  
//               {/* 右侧的部分 */}
//               <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
//                 <div className="xpanel-wrapper xpanel-wrapper-6" style={{ position: 'relative' }}>
//                   <div className="content_title">线粒体状况占比</div>
//                     <BorderBox1>
//                       <div className="xpanel">
//                         <div className="fill-h2">
//                           {labelValue !== null ? (
//                             <div style={containerStyle1}>
//                               <table style={tableStyle1}>
//                                 <thead>
//                                   <tr>
//                                     <th style={thStyle1}>Label</th>
//                                     <th style={thStyle1}>Extral</th>
//                                     <th style={thStyle1}>Insider</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   <tr style={{ backgroundColor: '#f2f2f2' }}>
//                                     <td style={tdStyle1}>{labelValue}</td>
//                                     <td style={tdStyle1}>{currentExtralData && !isNaN(currentExtralData[labelValue]) ? Number(currentExtralData[labelValue]).toFixed(3) : '无数据'}</td>
//                                     <td style={tdStyle1}>{currentInsiderData && !isNaN(currentInsiderData[labelValue]) ? Number(currentInsiderData[labelValue]).toFixed(3) : '无数据'}</td>
//                                   </tr>
//                                 </tbody>
//                               </table>
//                             </div>
//                           ) : ''}
//                         </div>
//                       </div>
//                     </BorderBox1>
//                 </div>
//               </div>
//             </div>
  
//             <div className="row fill-h0" style={{ display: 'flex' }}>
//             </div>
  
//             <div className="row fill-h1" style={{ display: 'flex' }}>
//               <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
//                 <BorderBox8>
//                   <div className="xpanel2">
//                     <div className="fill-h" id="mainMap2"></div>
//                   </div>
//                 </BorderBox8>
//               </div>
  
//               <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
//                 <BorderBox8>
//                   <div className="xpanel2">
//                     <div className="fill-h" id="mainMap3"></div>
//                   </div>
//                 </BorderBox8>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );   
//   }
  
  
  
//   }

//   export default App;




import React, { Component } from 'react'
import * as echarts from 'echarts';
import geoJson from './map/china.json'
import { BorderBox1 ,BorderBox8 ,BorderBox13,Decoration1 ,ScrollBoard,ScrollRankingBoard } from '@jiaminghi/data-view-react'
import './index2.css'
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import Papa from 'papaparse';
import npyjs from 'npyjs';


function BackButton() {
  const navigate = useNavigate();
  return (
    <Button 
      type="primary" 
      style={{ position: 'absolute', top: '15px', left: '70px', zIndex: 1000 }}
      onClick={() => navigate(-1)}
    >
      返回
    </Button>
  );
}

class App extends Component {
  

  state = {
    chartData: [],
    labelData: null, // 当前标签对应的数据
    totalData: [],
    imageFiles1: [],
    currentImageIndex1: 0,
    imageFiles2: [],
    currentImageIndex2: 0,
    topdata: {},
    tabledata: {},
    tableData2: [], 
    labelValue: null, // 当前线粒体标签值
    tooltipStyle: { display: 'none', position: 'absolute', top: 0, left: 0 },
    tooltipContent: ''
  };
  
  async componentDidMount() {
    try {
      await Promise.all([this.loadImages1(), this.loadImages2(), this.loadCSVSingle(), this.loadCSVTotal()]);
      this.initializeCharts();
    } catch (error) {
      console.error('Error during component mount:', error);
    }

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  async loadCSVSingle() {
    try {
      const response = await fetch('../free/outputs/single_info.csv');
      const csvData = await response.text();
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          this.setState({ chartData: result.data }, this.updateChart1);
        },
        error: (error) => console.error('解析CSV文件出错:', error),
      });
    } catch (error) {
      console.error('Error fetching single CSV:', error);
    }
  }

  async loadCSVTotal() {
    try {
      const response = await fetch('../free/outputs/total_info.csv');
      const csvData = await response.text();
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          this.setState({ totalData: result.data }, this.updateChart2);
        },
        error: (error) => console.error('解析CSV文件出错:', error),
      });
    } catch (error) {
      console.error('Error fetching total CSV:', error);
    }
  }
  async loadImages1() {
    try {
      const response = await fetch('../free/outputs/seg.json');
      // const response = await fetch('/free/seg/png_paths.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const imagePaths1 = await response.json();
      this.setState({ imageFiles1: imagePaths1, currentImageIndex1: 0 });
    } catch (error) {
      console.error('Error loading image paths:', error);
    }
  }

  async loadImages2() {
    try { 
      // const response = await fetch('/free/seg_source/source_paths.json');
      const response = await fetch('../free/com_source/com_source.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const imagePaths2 = await response.json();
      this.setState({ imageFiles2: imagePaths2, currentImageIndex2: 0 });
    } catch (error) {
      console.error('Error loading source image paths:', error);
    }
  }

  async fetchLabelFromNpy(x, y) {
    try {
      const imageName = this.state.imageFiles1[this.state.currentImageIndex1];
      if (!imageName) throw new Error('当前图像文件名未定义');
  
      const fileName = imageName.split('/').pop().replace(/\.[^/.]+$/, '');
      const filePath = `/free/outputs/${fileName}.npy`;
      const npy = new npyjs();
  
      const response = await fetch(filePath);
      const buffer = await response.arrayBuffer();
      const npyData = await npy.load(buffer);
  
      if (!npyData || !npyData.data) throw new Error('npyData 或 npyData.data 不存在');
  
      const width = 800;
      const height = 800;
  
      const index = y * width + x;
      if (index < 0 || index >= npyData.data.length) {
        console.error('索引超出数据范围:', index);
        return null;
      }
  
      return npyData.data[index];
    } catch (error) {
      console.error('获取 npy 文件出错:', error);
      return null;
    }
  }
  
  

  handleMouseMove = async (event) => {
    const img = event.currentTarget.querySelector('img');
    const rect = img.getBoundingClientRect();
    
    // 鼠标在缩放后的图像上的位置
    const mouseXInImg = event.clientX - rect.left;
    const mouseYInImg = event.clientY - rect.top;
    
    // 图像的缩放比例
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    // 将鼠标位置转换为原始图像上的位置
    const xIndex = Math.floor(mouseXInImg * scaleX);
    const yIndex = Math.floor(mouseYInImg * scaleY);
  
    try {
      const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);
      
      this.setState({
        tooltipStyle: {
          visibility: 'visible',
          opacity: 1,
          position: 'absolute',
          top: (event.clientY - rect.top) + 10 + 'px', // 距离鼠标稍微偏移
          left: (event.clientX - rect.left) + 10 + 'px', // 距离鼠标稍微偏移
          backgroundColor: '#333',
          color: '#fff',
          padding: '5px',
          borderRadius: '3px',
          pointerEvents: 'none',
          zIndex: 1000
        },
        tooltipContent: labelValue !== null ? `label: ${labelValue}` : '无标签'
      });
    } catch (error) {
      console.error('获取标签值时出错:', error);
      this.setState({
        tooltipStyle: {
          visibility: 'hidden',
          opacity: 0
        },
        tooltipContent: ''
      });
    }
  }
  handleMouseLeave = () => {
    this.setState({
      tooltipStyle: {
        visibility: 'hidden',
        opacity: 0
      },
      tooltipContent: ''
    });
  }

  

  async fetchDataForLabel() {
    const { chartData, labelValue, imageFiles1, currentImageIndex1 } = this.state;
    if (chartData.length === 0) return;
    
    let currentData = null;

    try {
      // Getting the current image URL
      const imageUrl = imageFiles1[currentImageIndex1];
      if (!imageUrl) throw new Error('当前图像文件名未定义');

      // Extracting the filename from the URL.
      const fileName = imageUrl.split('/').pop().replace(/\.[^/.]+$/, '') + '.png';
      
      // Searching the data row corresponding to the image.
      const dataRow = chartData.find(data => data.image_name === fileName);
      if (dataRow) {
        if (labelValue === 0) {
          // Display all data if the label is 0
          currentData = { ...dataRow };
        } else {
          // For labels 1 to 14, extract the corresponding extral and insider data
          currentData = {
            extral: dataRow[`label_${labelValue}_extral`],
            insider: dataRow[`label_${labelValue}_insider`]
          };
        }
      } else {
        console.error('未找到对应图像的数据:', fileName);
      }
    } catch (error) {
      console.error('获取标签数据时出错:', error);
    }

    // Calculate the sum of extralData and insiderData
    const extralSum = (currentData?.extral || []).reduce((sum, value) => sum + (value || 0), 0);
    const insiderSum = (currentData?.insider || []).reduce((sum, value) => sum + (value || 0), 0);

    // For debugging: log the calculated sums and new table data
    console.log('Extral Sum:', extralSum);
    console.log('Insider Sum:', insiderSum);
    console.log('Image Name:', imageFiles1[currentImageIndex1]);

    this.setState({ 
      labelData: currentData,
      tableData2: [{ 
        images_name: imageFiles1[currentImageIndex1], 
        extralData_sum: extralSum, 
        insiderData_sum: insiderSum 
      }]
    });
  };
  
  
  
  
  handleClick = async (event) => {
    const img = event.currentTarget.querySelector('img'); // 获取图片元素
    const rect = img.getBoundingClientRect(); // 获取图片的边界矩形
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    // 计算缩放比例
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
  
    // 缩放坐标
    const xIndex = Math.floor(x * scaleX);
    const yIndex = Math.floor(y * scaleY);
  
    const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);
    
    this.setState({
      labelValue,
      labelData: {
        extral: labelValue !== null ? `Extral for ${labelValue}` : '无标签', // Replace with your logic
        insider: labelValue !== null ? `Insider for ${labelValue}` : '无标签' // Replace with your logic
      }
    });
  }
  
  
  updateChart1 = () => {
    const svgElement = document.querySelector('svg[width="200px"][height="50px"]');

    // 如果找到，则删除该元素
    if (svgElement) {
        svgElement.remove();
    }
    const { chartData, currentImageIndex1 } = this.state;
    const currentData = chartData[currentImageIndex1];
  
    console.log('当前图表数据:', currentData); // 确保数据存在
  
    if (!currentData) return;
  
    // 生成 X 轴的标签名称
    const labels = Object.keys(currentData)
      .filter(key => key.endsWith('_extral'))
      .map(key => key.replace('_extral', ''));
  
    console.log('X轴标签:', labels);
  
    // 提取 extral 和 insider 的数据
    const extralData = labels.map(label => currentData[`${label}_extral`]);
    const insiderData = labels.map(label => currentData[`${label}_insider`]);
  
    console.log('Extral数据:', extralData);
    console.log('Insider数据:', insiderData);
      // 计算 extralData 和 insiderData 的总和
    const extralData_sum = extralData.reduce((sum, value) => sum + (value || 0), 0);
    const insiderData_sum = insiderData.reduce((sum, value) => sum + (value || 0), 0);

    console.log('Extral数据总和:', extralData_sum);
    console.log('Insider数据总和:', insiderData_sum);
    this.setState({
      currentLabels: labels,
      currentExtralData: extralData,
      currentInsiderData: insiderData,
      currentExtralSum: extralData_sum,
      currentInsiderSum: insiderData_sum
    });
    
    
  
    const chart = echarts.init(document.getElementById('mainMap2'));
  
    chart.setOption({
      title: {
        show: true,
        // text: '图表标题', // 这里可以根据需要修改标题
        x: 'center',
        textStyle: {
          fontSize: 20,
          color: '#01c4f7', // 与 updateChart2 一致
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let tooltipText = '';
          params.forEach(item => {
            tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
          });
          return tooltipText;
        }
      },
      legend: {
        data: ['Extral', 'Insider'],
        textStyle: {
          fontSize: 10, // 缩小图例字体大小
          color: '#ffffff'
        },
        orient: 'vertical',  // 设置图例为垂直方向
        right: 10,           // 将图例放置在右侧
        top: 20,             // 将图例放置在顶部
        itemWidth: 16,       // 缩小图例项的宽度
        itemHeight: 10,      // 缩小图例项的高度
        itemGap: 8           // 缩小图例项的间隔
      },
      grid: {
        left: '10%',
        right: '5%',
        bottom: '20%', // 统一底部空间
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          textStyle: {
            color: '#c3dbff',
            fontSize: 12
          },
          rotate: 45, // 如果标签过长，考虑旋转标签
          interval: 0 // 确保所有标签都显示
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#07234d']
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          textStyle: {
            color: '#c3dbff',
            fontSize: 12
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#07234d']
          }
        }
      },
      series: [
        {
          name: 'Extral',
          type: 'bar',
          data: extralData,
          itemStyle: {
            color: '#9702fe',
          }
        },
        {
          name: 'Insider',
          type: 'bar',
          data: insiderData,
          itemStyle: {
            color: '#ff893b',
          }
        }
      ],
    });
  };
  

  updateChart2 = () => {
    const { totalData } = this.state;

    // 过滤掉无效数据
    const validData = totalData.filter(row => row.label_name !== null);

    // 处理数据
    const labels = validData.map(row => row.label_name);
    const totalExtral = validData.map(row => row.total_extral);
    const totalInside = validData.map(row => row.total_inside);

    const chart = echarts.init(document.getElementById('mainMap3'));

    chart.setOption({
      title: {
        show: true,
        x: 'center',
        textStyle: {
          fontSize: 20,
          color: '#01c4f7'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          let tooltipText = '';
          params.forEach(item => {
            tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
          });
          return tooltipText;
        }
      },
      legend: {
        data: ['Extral', 'Insider'],
        textStyle: {
          fontSize: 12,
          color: '#ffffff'
        },
        top: '10%',
        right: '10%',
        orient: 'vertical',
        itemWidth: 20,
        itemHeight: 12,
        itemGap: 10
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          textStyle: {
            color: '#c3dbff',
            fontSize: 12
          },
          rotate: 45, // 如果标签过长，考虑旋转标签
          interval: 0 // 确保所有标签都显示
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#07234d']
          }
        }
      },
      
      yAxis: {
        type: 'value',
        axisLabel: {
          textStyle: {
            color: '#c3dbff',
            fontSize: 12
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#07234d']
          }
        }
      },
      series: [
        {
          name: 'Extral',
          type: 'bar',
          data: totalExtral,
          itemStyle: {
            color: '#9702fe',
          }
        },
        {
          name: 'Insider',
          type: 'bar',
          data: totalInside,
          itemStyle: {
            color: '#ff893b',
          }
        }
      ],
      dataZoom: [
        {
          type: 'inside'
        },
        {
          type: 'slider',
          height: 10, // 调整滑块的高度
          // bottom: 0 // 将滑块放在图表的底部，避免遮挡数据
        }
      ]
    });
  };
  
  componentDidUpdate(prevProps, prevState) {
    // 如果索引发生变化，更新图表
    if (prevState.currentImageIndex1 !== this.state.currentImageIndex1 || 
        prevState.currentImageIndex2 !== this.state.currentImageIndex2) {
      this.updateChart1();
      this.fetchDataAndUpdateChart();
      // this.updateChart2();
    }
  }

// 获取轮播图和线粒体健康状况pie图
  fetchDataAndUpdateChart() {
    const { currentImageIndex, imageFiles } = this.state;
    if (!imageFiles || imageFiles.length === 0) return;
    
    const currentImagePath = imageFiles[currentImageIndex];
    console.log("****currentImagePath", currentImagePath);
    
    // Normalize path separators (just in case)
    const normalizedPath = currentImagePath.replace(/\\/g, '/');
    
    // Extract filename
    const filenameWithExtension = normalizedPath.split('/').pop();
    
    // Remove file extension
    const filenameWithoutExtension = filenameWithExtension.split('.').slice(0, -1).join('.');
    
    console.log("Filename without extension:", filenameWithoutExtension);
    const newFilePath = `/free/class_predict/${filenameWithoutExtension}.txt`;
    console.log("New file path:", newFilePath);
    
    fetch(newFilePath)
      .then(response => response.text())
      .then(text => {
        const classAllMatch = text.match(/class_all:\s*\[(.*?)\]/);
        const cntAllMatch = text.match(/cnt_all:\s*\[(.*?)\]/);
        
        if (classAllMatch && cntAllMatch) {
          const class_all = classAllMatch[1].split(/\s+/).map(Number);
          const cnt_all = cntAllMatch[1].split(/\s+/).map(Number);
          
          // Process the data
          this.updateTopData(class_all);
          this.updateChart(cnt_all)
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }
  
  updateTopData(class_all) {
    const topdata = {
        data: class_all.map((value, index) => ({
            name: `mitochondrion ${index + 1}`,
            value: value === 0 ? '健康' : '不健康'
        })),
        carousel: 'page',
        scrollSpeed: 5
    };

    this.setState({ topdata });
    console.log("更新后的 topdata:", topdata);
}


  handleSliderChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    this.setState({
      currentImageIndex1: newIndex,
      currentImageIndex2: newIndex,
    });
  };

  handleResize = () => {
    const { myChart1, myChart2, myChart3, myChart4, myChart5, myChart6 } = this.state;
    [myChart1, myChart2, myChart3, myChart4, myChart5, myChart6].forEach(chart => {
      if (chart) chart.resize();
    });
  };


  initializeCharts = () => {
    if (
      document.getElementById('mainMap2') && document.getElementById('mainMap3')) {
      this.fetchDataAndUpdateChart();
      // this.initialECharts4();
      // this.initialECharts5();
    } else {
      console.error('必要的 DOM 元素未加载');
    }
  };
    // ------------------------------------------------------------
  
  initialECharts = () => {
    echarts.registerMap('zhongguo', geoJson)
    const flyGeo = {
      洛阳: [112.460299, 34.62677]
    }

    //飞线数据
    const flyVal = [
      [{ name: '洛阳' }, { name: '洛阳', value: 100 }]
    ]
    const convertFlyData = function(data) {
      let res = []
      for (let i = 0; i < data.length; i++) {
        let dataItem = data[i]
        let toCoord = flyGeo[dataItem[0].name]
        let fromCoord = flyGeo[dataItem[1].name]
        if (fromCoord && toCoord) {
          res.push({
            fromName: dataItem[1].name,
            toName: dataItem[0].name,
            coords: [fromCoord, toCoord]
          })
        }
      }
      return res
    }
    //报表配置
    const originName = '浙江'
    const flySeries = []
    ;[[originName, flyVal]].forEach(function(item, i) {
      flySeries.push(
        {
          name: item[0],
          type: 'lines',
          zlevel: 1,
          symbol: ['none', 'none'],
          symbolSize: 0,
          effect: {
            //特效线配置
            show: true,
            period: 5, //特效动画时间，单位s
            trailLength: 0.1, //特效尾迹的长度，从0到1
            symbol: 'arrow',
            symbolSize: 5
          },
          lineStyle: {
            normal: {
              color: '#f19000',
              width: 1,
              opacity: 0.6,
              curveness: 0.2 //线的平滑度
            }
          },
          data: convertFlyData(item[1])
        },
        {
          name: item[0],
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            //涟漪特效
            period: 5, //特效动画时长
            scale: 4, //波纹的最大缩放比例
            brushType: 'stroke' //波纹的绘制方式：stroke | fill
          },
          label: {
            normal: {
              show: false,
              position: 'right',
              formatter: '{b}'
            }
          },
          symbol: 'circle',
          symbolSize: function(val) {
            //根据某项数据值设置符号大小
            return val[2] / 10
          },
          itemStyle: {
            normal: {
              color: '#f19000'
            }
          },
          data: item[1].map(function(dataItem) {
            return {
              name: dataItem[1].name,
              value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
            }
          })
        },
        {
          //与上层的点叠加
          name: item[0],
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          symbol: 'circle',
          symbolSize: function(val) {
            //根据某项数据值设置符号大小
            return val[2] / 15
          },
          itemStyle: {
            normal: {
              color: '#f00'
            }
          },
          data: item[1].map(function(dataItem) {
            return {
              name: dataItem[1].name,
              value: flyGeo[dataItem[1].name].concat([dataItem[1].value])
            }
          })
        }
      )
    })

    this.setState(
      { myChart1: echarts.init(document.getElementById('mainMap')) },
      () => {
        this.state.myChart1.setOption({
          tooltip: {
            trigger: 'item'
          },
        })
      }
    )
  }

  render() {
    const {
      tooltipStyle,
      tooltipContent,
      labelValue,
      labelData,
      imageFiles1,
      currentImageIndex1,
      imageFiles2,
      currentImageIndex2,
      currentExtralSum,
      currentInsiderSum,
      currentExtralData,
      currentInsiderData
    } = this.state;
  
    const currentImage1 = imageFiles1 && imageFiles1.length > 0 ? imageFiles1[currentImageIndex1] : null;
  
    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80%',
      marginTop: '20px',
    };
  
    const tableStyle = {
      margin: '0 auto',
      borderCollapse: 'collapse',
      fontSize: '18px',
      textAlign: 'center',
      marginTop: '40px',
    };
  
    const thStyle = {
      border: '1px solid #dddddd',
      padding: '8px',
      backgroundColor: '#333',
      color: 'white',
    };
  
    const tdStyle = {
      border: '1px solid #dddddd',
      padding: '8px',
    };
  
    const tooltipDefaultStyle = {
      position: 'absolute',
      backgroundColor: '#333',
      color: '#fff',
      padding: '5px',
      borderRadius: '3px',
      pointerEvents: 'none',
      zIndex: 1000,
    };


    const containerStyle1 = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80%',
      marginTop: '0px',
    };
    
    const tableStyle1 = {
      width: '80%', // 增加表格宽度以使其更宽
      margin: '0 auto',
      borderCollapse: 'collapse',
      fontSize: '18px',
      textAlign: 'center',
      marginTop: '25px',
    };
    
    const thStyle1 = {
      border: '1px solid #dddddd',
      padding: '8px',
      backgroundColor: '#333',
      color: 'white',
    };
    
    const tdStyle1 = {
      border: '1px solid #dddddd',
      padding: '8px',
    };
    
    const tooltipDefaultStyle1 = {
      position: 'absolute',
      backgroundColor: '#333',
      color: '#fff',
      padding: '5px',
      borderRadius: '3px',
      pointerEvents: 'none',
      zIndex: 1000,
    };
  
    const formattedExtralSum = currentExtralSum ? currentExtralSum.toFixed(3) : '暂无数据';
    const formattedInsiderSum = currentInsiderSum ? currentInsiderSum.toFixed(3) : '暂无数据';
  
    return (
      <div className="data">
        <header className="header_main">
          <div className="left_bg"></div>
          <div className="right_bg"></div>
          <h3>Data Visualization</h3>
        </header>
        <BackButton />
        <div className="wrapper">
          <div className="container-fluid">
            <div className="row fill-h" style={{ display: 'flex' }}>
              <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5">
                  <BorderBox1>
                    <div className="content_title">The sum of outer membrane and inner cristae</div>
                    <div style={containerStyle}>
                      <table style={tableStyle}>
                        <thead>
                          <tr>
                            <th style={thStyle}>Extral Sum</th>
                            <th style={thStyle}>Insider Sum</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={tdStyle}>{formattedExtralSum}</td>
                            <td style={tdStyle}>{formattedInsiderSum}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </BorderBox1>
                </div>
              </div>
  
              <div className="col-lg-6 fill-h" style={{ width: '50%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-5">
                  <div className="xpanel" style={{ position: 'relative' }}>
                    {currentImage1 ? (
                      <div className="class_images">
                        <div>
                          <img
                            src={imageFiles2[currentImageIndex2]}
                            alt={`Image ${currentImageIndex2}`}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>
                        <div
                          className="source_images"
                          onMouseMove={this.handleMouseMove}
                          onClick={this.handleClick}
                          onMouseLeave={this.handleMouseLeave}
                          // onMouseLeave={this.handleMouseLeave}
                        >
                          <img
                            src={imageFiles1[currentImageIndex1]}
                            alt={`Image ${currentImageIndex1}`}
                            style={{ width: '100%', height: 'auto' }}
                          />
                          <div
                            style={{ ...tooltipDefaultStyle, ...tooltipStyle }} // 合并样式
                            className="tooltip"
                          >
                            {tooltipContent}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={imageFiles1.length - 1}
                          value={currentImageIndex1}
                          onChange={this.handleSliderChange}
                          style={{ width: '100%' }}
                        />
                      </div>
                    ) : (
                      <div>正在加载图片...</div>
                    )}
                    {/* <div style={{ height: 60, width: 200, position: 'absolute', bottom: 20, left: 20 }}>
                      {labelValue !== null ? `标签值: ${labelValue}` : '点击获取标签'}
                    </div> */}
                    <div style={{ height: 60, width: 200, position: 'absolute', top: 20, right: 20 }}>
                      <Decoration1 style={{ width: '100%', height: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
  
              {/* 右侧的部分 */}
              <div className="col-lg-3 fill-h" style={{ width: '25%' }}>
                <div className="xpanel-wrapper xpanel-wrapper-6" style={{ position: 'relative' }}>
                  <div className="content_title">detailed data</div>
                    <BorderBox1>
                      <div className="xpanel">
                        <div className="fill-h2">
                          {labelValue !== null ? (
                            <div style={containerStyle1}>
                              <table style={tableStyle1}>
                                <thead>
                                  <tr>
                                    <th style={thStyle1}>Label</th>
                                    <th style={thStyle1}>Extral</th>
                                    <th style={thStyle1}>Insider</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <td style={tdStyle1}>{labelValue}</td>
                                    <td style={tdStyle1}>{currentExtralData && !isNaN(currentExtralData[labelValue - 1]) ? Number(currentExtralData[labelValue - 1]).toFixed(3) : '无数据'}</td>
                                    <td style={tdStyle1}>{currentInsiderData && !isNaN(currentInsiderData[labelValue - 1]) ? Number(currentInsiderData[labelValue - 1]).toFixed(3) : '无数据'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : ''}
                        </div>
                      </div>
                    </BorderBox1>
                </div>
              </div>
            </div>
  
            <div className="row fill-h0" style={{ display: 'flex' }}>
            </div>
  
            <div className="row fill-h1" style={{ display: 'flex' }}>
              <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
                <BorderBox8>
                  <div className="content_title">Single label value statistics</div>
                  <div className="xpanel2">
                    <div className="fill-h" id="mainMap2"></div>
                  </div>
                </BorderBox8>
              </div>
  
              <div className="col-lg-6 fill-h1_0" style={{ width: '50%' }}>
                <BorderBox8>
                  <div className="content_title">Sum of label values statistics</div>
                  <div className="xpanel2">
                    <div className="fill-h" id="mainMap3"></div>
                  </div>
                </BorderBox8>
              </div>
            </div>
          </div>
        </div>
      </div>
    );   
  }
  
  
  
  }

  export default App;







// import React, { Component } from 'react';
// import * as echarts from 'echarts';
// import geoJson from './map/china.json';
// import { BorderBox1, BorderBox8, BorderBox13, Decoration1, ScrollBoard, ScrollRankingBoard } from '@jiaminghi/data-view-react';
// import './index2.css';
// import { useNavigate } from 'react-router-dom';
// import { Button } from 'antd';
// import Papa from 'papaparse';
// import npyjs from 'npyjs';

// function BackButton() {
//   const navigate = useNavigate();
//   return (
//     <Button 
//       type="primary"
//       style={{ position: 'absolute', top: '15px', left: '70px', zIndex: 1000 }}
//       onClick={() => navigate(-1)}
//     >
//       返回
//     </Button>
//   );
// }

// class App extends Component {
//   state = {
//     chartData: [],
//     labelData: null,
//     totalData: [],
//     imageFiles1: [],
//     currentImageIndex1: 0,
//     imageFiles2: [],
//     currentImageIndex2: 0,
//     topdata: {},
//     tabledata: {},
//     tableData2: [],
//     labelValue: null,
//     tooltipStyle: { display: 'none', position: 'absolute', top: 0, left: 0 },
//     tooltipContent: '',
//   };

//   async componentDidMount() {
//     try {
//       await Promise.all([this.loadImages1(), this.loadImages2(), this.loadCSVSingle(), this.loadCSVTotal()]);
//       this.initializeCharts();
//     } catch (error) {
//       console.error('Error during component mount:', error);
//     }

//     window.addEventListener('resize', this.handleResize);
//   }

//   componentWillUnmount() {
//     window.removeEventListener('resize', this.handleResize);
//   }

//   async loadCSVSingle() {
//     try {
//       const response = await fetch('/free/outputs/single_info.csv');
//       const csvData = await response.text();
//       Papa.parse(csvData, {
//         header: true,
//         dynamicTyping: true,
//         complete: (result) => {
//           this.setState({ chartData: result.data }, this.updateChart1);
//         },
//         error: (error) => console.error('解析CSV文件出错:', error),
//       });
//     } catch (error) {
//       console.error('Error fetching single CSV:', error);
//     }
//   }

//   async loadCSVTotal() {
//     try {
//       const response = await fetch('/free/outputs/total_info.csv');
//       const csvData = await response.text();
//       Papa.parse(csvData, {
//         header: true,
//         dynamicTyping: true,
//         complete: (result) => {
//           this.setState({ totalData: result.data }, this.updateChart2);
//         },
//         error: (error) => console.error('解析CSV文件出错:', error),
//       });
//     } catch (error) {
//       console.error('Error fetching total CSV:', error);
//     }
//   }

//   async loadImages1() {
//     try {
//       const response = await fetch('/free/outputs/seg.json');
//       if (!response.ok) throw new Error('Network response was not ok');
//       const imagePaths1 = await response.json();
//       this.setState({ imageFiles1: imagePaths1, currentImageIndex1: 0 });
//     } catch (error) {
//       console.error('Error loading image paths:', error);
//     }
//   }

//   async loadImages2() {
//     try {
//       const response = await fetch('/free/seg/png_paths.json');
//       if (!response.ok) throw new Error('Network response was not ok');
//       const imagePaths2 = await response.json();
//       this.setState({ imageFiles2: imagePaths2, currentImageIndex2: 0 });
//     } catch (error) {
//       console.error('Error loading source image paths:', error);
//     }
//   }

//   async fetchLabelFromNpy(x, y) {
//     try {
//       const imageName = this.state.imageFiles1[this.state.currentImageIndex1];
//       if (!imageName) throw new Error('当前图像文件名未定义');

//       const fileName = imageName.split('/').pop().replace(/\.[^/.]+$/, '');
//       const filePath = `/free/outputs/${fileName}.npy`;
//       const npy = new npyjs();

//       const response = await fetch(filePath);
//       const buffer = await response.arrayBuffer();
//       const npyData = await npy.load(buffer);

//       if (!npyData || !npyData.data) throw new Error('npyData 或 npyData.data 不存在');

//       const width = 800;
//       const height = 800;

//       const index = y * width + x;
//       if (index < 0 || index >= npyData.data.length) {
//         console.error('索引超出数据范围:', index);
//         return null;
//       }

//       return npyData.data[index];
//     } catch (error) {
//       console.error('获取 npy 文件出错:', error);
//       return null;
//     }
//   }

//   handleMouseMove = async (event) => {
//     const img = event.currentTarget.querySelector('img');
//     const rect = img.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     const scaleX = img.naturalWidth / img.width;
//     const scaleY = img.naturalHeight / img.height;

//     const xIndex = Math.floor(x * scaleX);
//     const yIndex = Math.floor(y * scaleY);

//     try {
//       const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);

//       this.setState({
//         tooltipStyle: {
//           display: 'block',
//           top: event.clientY + 15 + 'px',
//           left: event.clientX + 15 + 'px',
//         },
//         tooltipContent: labelValue !== null ? `线粒体编号: ${labelValue}` : '无标签',
//       });
//     } catch (error) {
//       console.error('获取标签值时出错:', error);
//       this.setState({
//         tooltipStyle: {
//           display: 'none',
//         },
//         tooltipContent: '',
//       });
//     }
//   }

//   handleMouseLeave = () => {
//     this.setState({
//       tooltipStyle: {
//         display: 'none',
//       },
//       tooltipContent: '',
//     });
//   }

//   async fetchDataForLabel() {
//     const { chartData, labelValue, imageFiles1, currentImageIndex1 } = this.state;
//     if (chartData.length === 0) return;

//     let currentData = null;

//     try {
//       const imageUrl = imageFiles1[currentImageIndex1];
//       if (!imageUrl) throw new Error('当前图像文件名未定义');

//       const fileName = imageUrl.split('/').pop().replace(/\.[^/.]+$/, '') + '.png';
//       const dataRow = chartData.find(data => data.image_name === fileName);
//       if (dataRow) {
//         if (labelValue === 0) {
//           currentData = { ...dataRow };
//         } else {
//           currentData = {
//             extral: dataRow[`label_${labelValue}_extral`],
//             insider: dataRow[`label_${labelValue}_insider`]
//           };
//         }
//       } else {
//         console.error('未找到对应图像的数据:', fileName);
//       }
//     } catch (error) {
//       console.error('获取标签数据时出错:', error);
//     }

//     const extralSum = (currentData?.extral || []).reduce((sum, value) => sum + (value || 0), 0);
//     const insiderSum = (currentData?.insider || []).reduce((sum, value) => sum + (value || 0), 0);

//     this.setState({
//       labelData: currentData,
//       tableData2: [{ 
//         images_name: imageFiles1[currentImageIndex1], 
//         extralData_sum: extralSum, 
//         insiderData_sum: insiderSum 
//       }]
//     });
//   }

//   handleClick = async (event) => {
//     const img = event.currentTarget.querySelector('img');
//     const rect = img.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     const scaleX = img.naturalWidth / img.width;
//     const scaleY = img.naturalHeight / img.height;

//     const xIndex = Math.floor(x * scaleX);
//     const yIndex = Math.floor(y * scaleY);

//     const labelValue = await this.fetchLabelFromNpy(xIndex, yIndex);

//     this.setState({
//       labelValue,
//       labelData: {
//         extral: labelValue !== null ? `Extral for ${labelValue}` : '无标签',
//         insider: labelValue !== null ? `Insider for ${labelValue}` : '无标签',
//       }
//     });
//   }

//   updateChart1 = () => {
//     const svgElement = document.querySelector('svg[width="200px"][height="50px"]');
//     if (svgElement) svgElement.remove();

//     const { chartData, currentImageIndex1 } = this.state;
//     const currentData = chartData[currentImageIndex1];

//     if (!currentData) return;

//     const labels = Object.keys(currentData)
//       .filter(key => key.endsWith('_extral'))
//       .map(key => key.replace('_extral', ''));

//     const extralData = labels.map(label => currentData[`${label}_extral`]);
//     const insiderData = labels.map(label => currentData[`${label}_insider`]);

//     const extralData_sum = extralData.reduce((sum, value) => sum + (value || 0), 0);
//     const insiderData_sum = insiderData.reduce((sum, value) => sum + (value || 0), 0);

//     this.setState({
//       currentLabels: labels,
//       currentExtralData: extralData,
//       currentInsiderData: insiderData,
//       currentExtralSum: extralData_sum,
//       currentInsiderSum: insiderData_sum
//     });

//     const chart = echarts.init(document.getElementById('mainMap2'));

//     chart.setOption({
//       title: {
//         show: true,
//         x: 'center',
//         textStyle: {
//           fontSize: 20,
//           color: '#01c4f7',
//         }
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: (params) => {
//           let tooltipText = '';
//           params.forEach(item => {
//             tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
//           });
//           return tooltipText;
//         }
//       },
//       legend: {
//         data: ['Extral', 'Insider'],
//         textStyle: {
//           fontSize: 10,
//           color: '#ffffff'
//         },
//         orient: 'vertical',
//         right: 10,
//         top: 20,
//         itemWidth: 16,
//         itemHeight: 10,
//         itemGap: 8
//       },
//       grid: {
//         left: '10%',
//         right: '5%',
//         bottom: '20%',
//         top: '10%'
//       },
//       xAxis: {
//         type: 'category',
//         data: labels,
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           },
//           rotate: 45,
//           interval: 0 
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       yAxis: {
//         type: 'value',
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           }
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Extral',
//           type: 'bar',
//           data: extralData,
//           itemStyle: {
//             color: '#9702fe',
//           }
//         },
//         {
//           name: 'Insider',
//           type: 'bar',
//           data: insiderData,
//           itemStyle: {
//             color: '#ff893b',
//           }
//         }
//       ],
//     });
//   }

//   updateChart2 = () => {
//     const { totalData } = this.state;

//     const validData = totalData.filter(row => row.label_name !== null);
//     const labels = validData.map(row => row.label_name);
//     const totalExtral = validData.map(row => row.total_extral);
//     const totalInside = validData.map(row => row.total_inside);

//     const chart = echarts.init(document.getElementById('mainMap3'));

//     chart.setOption({
//       title: {
//         show: true,
//         x: 'center',
//         textStyle: {
//           fontSize: 20,
//           color: '#01c4f7'
//         }
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: (params) => {
//           let tooltipText = '';
//           params.forEach(item => {
//             tooltipText += `${item.marker} ${item.seriesName}: ${item.value} nm<br />`;
//           });
//           return tooltipText;
//         }
//       },
//       legend: {
//         data: ['Extral', 'Insider'],
//         textStyle: {
//           fontSize: 12,
//           color: '#ffffff'
//         },
//         top: '10%',
//         right: '10%',
//         orient: 'vertical',
//         itemWidth: 20,
//         itemHeight: 12,
//         itemGap: 10
//       },
//       grid: {
//         left: '3%',
//         right: '15%',
//         bottom: '15%',
//         containLabel: true
//       },
//       xAxis: {
//         type: 'category',
//         data: labels,
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           },
//           rotate: 45,
//           interval: 0
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       yAxis: {
//         type: 'value',
//         axisLabel: {
//           textStyle: {
//             color: '#c3dbff',
//             fontSize: 12
//           }
//         },
//         splitLine: {
//           show: true,
//           lineStyle: {
//             color: ['#07234d']
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Extral',
//           type: 'bar',
//           data: totalExtral,
//           itemStyle: {
//             color: '#9702fe',
//           }
//         },
//         {
//           name: 'Insider',
//           type: 'bar',
//           data: totalInside,
//           itemStyle: {
//             color: '#ff893b',
//           }
//         }
//       ],
//       dataZoom: [
//         {
//           type: 'inside'
//         },
//         {
//           type: 'slider',
//           height: 10,
//         }
//       ]
//     });
//   }

//   componentDidUpdate(prevProps, prevState) {
//     if (prevState.currentImageIndex1 !== this.state.currentImageIndex1 || 
//         prevState.currentImageIndex2 !== this.state.currentImageIndex2) {
//       this.updateChart1();
//       this.fetchDataAndUpdateChart();
//     }
//   }

//   fetchDataAndUpdateChart() {
//     const { currentImageIndex, imageFiles } = this.state;
//     if (!imageFiles || imageFiles.length === 0) return;

//     const currentImagePath = imageFiles[currentImageIndex];
//     const normalizedPath = currentImagePath.replace(/\//g, '/');
//     const filenameWithExtension = normalizedPath.split('/').pop();
//     const filenameWithoutExtension = filenameWithExtension.split('.').slice(0, -1).join('.');
//     const newFilePath = `/free/class_predict/${filenameWithoutExtension}.txt`;

//     fetch(newFilePath)
//       .then(response => response.text())
//       .then(text => {
//         const classAllMatch = text.match(/class_all:\s*$$(.*?)$$/);
//         const cntAllMatch = text.match(/cnt_all:\s*$$(.*?)$$/);

//         if (classAllMatch && cntAllMatch) {
//           const class_all = classAllMatch[1].split(/\s+/).map(Number);
//           const cnt_all = cntAllMatch[1].split(/\s+/).map(Number);

//           this.updateTopData(class_all);
//           this.updateChart(cnt_all)
//         }
//       })
//       .catch(error => console.error('Error fetching data:', error));
//   }

//   updateTopData(class_all) {
//     const topdata = {
//         data: class_all.map((value, index) => ({
//             name: `mitochondrion ${index + 1}`,
//             value: value === 0 ? '健康' : '不健康'
//         })),
//         carousel: 'page',
//         scrollSpeed: 5
//     };

//     this.setState({ topdata });
//   }

//   handleSliderChange = (event) => {
//     const newIndex = parseInt(event.target.value, 10);
//     this.setState({
//       currentImageIndex1: newIndex,
//       currentImageIndex2: newIndex,
//     });
//   };

//   handleResize = () => {
//     const { myChart1, myChart2, myChart3, myChart4, myChart5, myChart6 } = this.state;
//     [myChart1, myChart2, myChart3, myChart4, myChart5, myChart6].forEach(chart => {
//       if (chart) chart.resize();
//     });
//   };

//   initializeCharts = () => {
//     if (document.getElementById('mainMap2') && document.getElementById('mainMap3')) {
//       this.fetchDataAndUpdateChart();
//     } else {
//       console.error('必要的 DOM 元素未加载');
//     }
//   };

//   initialECharts = () => {
//     echarts.registerMap('zhongguo', geoJson);
//     const flyGeo = {
//       洛阳: [112.460299, 34.62677]
//     }

//     const flyVal = [
//       [{ name: '洛阳' }, { name: '洛阳', value: 100 }]
//     ]
//     const convertFlyData = function(data) {
//       let res = []
//       for (let i = 0; i < data.length; i++) {
//         let dataItem = data[i];
//         let toCoord = flyGeo[dataItem[0].name];
//         let fromCoord = flyGeo[dataItem[1].name];
//         if (fromCoord && toCoord) {
//           res.push({
//             fromName: dataItem[1].name,
//             toName: dataItem[0].name,
//             coords: [fromCoord, toCoord]
//           });
//         }
//       }
//       return res;
//     }

//     const originName = '浙江';
//     const flySeries = [];
//     [[originName, flyVal]].forEach(function(item, i) {
//       flySeries.push({
//         name: item[0],
//         type: 'lines',
//         zlevel: 2,
//         large: true,
//         effect: {
//           show: true,
//           constantSpeed: 30,
//           symbol: 'pin',
//           symbolSize: 3,
//           trailLength: 0,
//         },
//         lineStyle: {
//           normal: {
//             color: '#46bee9',
//             width: 1,
//             opacity: 0.6,
//             curveness: 0.1
//           }
//         },
//         data: convertFlyData(item[1])
//       });
//     });

//     const mainMapChart = {
//       title: {
//         show: false,
//         text: '地图',
//       },
//       series: flySeries,
//     };
//     const chart = echarts.init(document.getElementById('mainMap'));
//     chart.setOption(mainMapChart);
//     this.setState({ myChart1: chart });
//   }

//   render() {
//     const { imageFiles1, currentImageIndex1, imageFiles2, currentImageIndex2, tooltipStyle, tooltipContent, topdata, tableData2 } = this.state;

//     return (
//       <div className="container">
//         <BackButton />
//         <BorderBox1 className="box box1">
//           <div id="mainMap" style={{ width: '100%', height: '100%' }}></div>
//         </BorderBox1>
//         <BorderBox8 className="box box2">
//           <ScrollRankingBoard config={topdata} />
//         </BorderBox8>
//         <BorderBox13 className="box box3">
//           <div id="mainMap2" style={{ width: '100%', height: '100%' }}></div>
//         </BorderBox13>
//         <BorderBox1 className="box box4">
//           <ScrollBoard config={{ data: tableData2 }} />
//         </BorderBox1>
//         <BorderBox13 className="box box5">
//           <div id="mainMap3" style={{ width: '100%', height: '100%' }}></div>
//         </BorderBox13>
//         <BorderBox13 className="box box6">
//           <Decoration1 className="inline-decoration" />
//           <div className="image-slider">
//             <span>选择图像: </span>
//             <input
//               type="range"
//               min="0"
//               max={imageFiles1.length - 1}
//               value={currentImageIndex1}
//               onChange={this.handleSliderChange}
//             />
//             <span>{currentImageIndex1 + 1} / {imageFiles1.length}</span>
//           </div>
//           <div
//             className="image-container"
//             onMouseMove={this.handleMouseMove}
//             onMouseLeave={this.handleMouseLeave}
//             onClick={this.handleClick}
//           >
//             <img src={imageFiles1[currentImageIndex1]} alt="Segmented" />
//             <img src={imageFiles2[currentImageIndex2]} alt="Original" />
//           </div>
//           <div style={tooltipStyle} className="tooltip-container">{tooltipContent}</div>
//         </BorderBox13>
//       </div>
//     );
//   }
// }

// export default App;

