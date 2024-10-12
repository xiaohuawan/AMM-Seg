// import React from 'react';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import Box from '@mui/material/Box';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { useNavigate } from 'react-router-dom'; // 导入 useNavigate

// // project imports
// import MainCard from 'ui-component/cards/MainCard';

// // ==============================|| SAMPLE PAGE ||============================== //

// const SamplePage = () => {
//   const navigate = useNavigate(); // 使用 useNavigate 获取 navigate 函数

//   async function handleRunClick() {
//     try {
//       const response = await fetch('http://localhost:5000/compute', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ file_url: 'http://localhost:3000/free/seg/png' }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(data); // 在控制台输出服务器返回的消息
//     } catch (error) {
//       console.error('Error:', error); // 捕获并处理请求中的错误
//     }
//   }

//   return (
//     <div>
//       <MainCard title="Compute Card">
//         <Typography variant="body2">
//           Click the "Run" button below to perform calculations on the mitochondrial outer membrane and cristae.
//         </Typography>
//       </MainCard>

//       <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
//         <Button
//           variant="contained"
//           color="primary"
//           startIcon={<CloudUploadIcon />}
//           onClick={handleRunClick}
//         >
//           Run
//         </Button>
//         <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => {
//             navigate('/visualizationCom');
//           }}
//           sx={{ padding: '8px 26px', fontSize: '0.875rem' }}
//         >
//           Data
//         </Button>
//       </Box>
//     </div>
//   );
// };

// export default SamplePage;


// 指定的路径
// import React, { useState, useRef } from 'react';
// import { Container, Typography, Paper, TextField, Button, Box, IconButton } from '@mui/material';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import CloseIcon from '@mui/icons-material/Close';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import MainCard from 'ui-component/cards/MainCard';

// const FileUploadAndPreview = () => {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [fileNames, setFileNames] = useState([]);
//   const [isDragActive, setIsDragActive] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isDataReady, setIsDataReady] = useState(false);  // New state for data readiness

//   const fileDropRef = useRef(null);
//   const navigate = useNavigate();

//   const handleDrop = (event) => {
//     event.preventDefault();
//     setIsDragActive(false);
//     const files = Array.from(event.dataTransfer.files);
//     const filteredFiles = files.filter(file => file.type === 'image/tiff');
//     setSelectedFiles(filteredFiles);
//     setFileNames(filteredFiles.map(file => file.name));
//   };

//   const handleDragOver = (event) => {
//     event.preventDefault();
//     setIsDragActive(true);
//   };

//   const handleDragLeave = () => {
//     setIsDragActive(false);
//   };

//   const handleFileInput = (event) => {
//     const files = Array.from(event.target.files);
//     const filteredFiles = files.filter(file => file.type === 'image/tiff');
//     setSelectedFiles(filteredFiles);
//     setFileNames(filteredFiles.map(file => file.name));
//   };

//   const handleRemoveFile = (index) => {
//     const updatedFiles = selectedFiles.filter((_, i) => i !== index);
//     setSelectedFiles(updatedFiles);
//     setFileNames(updatedFiles.map(file => file.name));
//   };

//   async function handleRun() {
//     setIsProcessing(true);  // Set processing to true
//     try {
//       const response = await axios.post('http://127.0.0.1:5000/compute', 
//         {
//           json_url: 'http://localhost:3000/free/seg/png_paths.json'
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       console.log('Success:', response.data);
//       setIsDataReady(true);  // Set data ready to true
//     } catch (error) {
//       console.error('Error processing files:', error);
//     } finally {
//       setIsProcessing(false);  // Always set processing to false
//     }
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4 }}>
//       {/* <Typography variant="h4" gutterBottom align="center">
//         文件上传与预览
//       </Typography> */}
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'flex-start',
//           gap: 2,
//         }}
//       >
//         {/* <Paper
//           ref={fileDropRef}
//           onDrop={handleDrop}
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           sx={{
//             border: isDragActive ? '2px dashed #3f51b5' : 'none',
//             padding: 2,
//             textAlign: 'center',
//             backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
//             marginBottom: 2,
//             width: '100%',
//             maxWidth: 600,
//           }}
//         > */}
//           {/* <TextField
//             label="拖放TIF图片"
//             variant="outlined"
//             fullWidth
//             value={fileNames.join(', ')}
//             disabled
//             InputProps={{
//               endAdornment: (
//                 <Button
//                   variant="contained"
//                   component="label"
//                   startIcon={<CloudUploadIcon />}
//                   sx={{ padding: '4px 14px', fontSize: '0.875rem' }}
//                 >
//                   选择
//                   <input
//                     type="file"
//                     hidden
//                     multiple
//                     accept=".tif,.tiff, .png"
//                     onChange={handleFileInput}
//                   />
//                 </Button>
//               ),
//             }}
//           /> */}
//         <MainCard title="Compute Card">
//           <Typography variant="body2">
//             Click the "Run" button below to perform calculations on the mitochondrial outer membrane and cristae.
//           </Typography>
//         </MainCard>
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
//             {selectedFiles.map((file, index) => (
//               <Box key={index} sx={{ position: 'relative', margin: 1 }}>
//                 <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
//                 <IconButton
//                   sx={{ position: 'absolute', top: 0, right: 0 }}
//                   onClick={() => handleRemoveFile(index)}
//                 >
//                   <CloseIcon style={{ color: 'red' }} />
//                 </IconButton>
//               </Box>
//             ))}
//           </Box>
//         {/* </Paper> */}

//         <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleRun}
//             disabled={isProcessing}
//             sx={{ padding: '8px 20px', fontSize: '0.875rem' }}
//           >
//             {isProcessing ? 'Processing...' : 'Run'}
//           </Button>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() => navigate('/visualizationCom')}
//             disabled={!isDataReady}  // Disable button if data is not ready
//             sx={{ padding: '8px 20px', fontSize: '0.875rem' }}
//           >
//             Data
//           </Button>
//         </Box>
//       </Box>
//     </Container>
//   );
// };

// export default FileUploadAndPreview;


import React, { useState, useRef } from 'react';
import { Container, Typography, Paper, TextField, Button, Box, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';

const FileUploadAndPreview = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);  // New state for data readiness

  const fileDropRef = useRef(null);
  const navigate = useNavigate();

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    // Allow both .tif and .png files
    const filteredFiles = files.filter(file => file.type === 'image/tiff' || file.type === 'image/png');
    setSelectedFiles(filteredFiles);
    setFileNames(filteredFiles.map(file => file.name));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files);
    // Allow both .tif and .png files
    const filteredFiles = files.filter(file => file.type === 'image/tiff' || file.type === 'image/png');
    setSelectedFiles(filteredFiles);
    setFileNames(filteredFiles.map(file => file.name));
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFileNames(updatedFiles.map(file => file.name));
  };

  async function handleRun() {
    setIsProcessing(true);  // Set processing to true
  
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/compute', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Success:', response.data);
      setIsDataReady(true);  // Set data ready to true
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);  // Always set processing to false
    }
  }
  

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 2,
        }}
      >
        <Paper
          ref={fileDropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            border: isDragActive ? '2px dashed #3f51b5' : 'none',
            padding: 2,
            textAlign: 'center',
            backgroundColor: isDragActive ? '#f0f0f0' : '#fafafa',
            marginBottom: 2,
            width: '100%',
            maxWidth: 600,
          }}
        >
          <TextField
            label="拖放TIF或PNG图片"
            variant="outlined"
            fullWidth
            value={fileNames.join(', ')}
            disabled
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ padding: '4px 14px', fontSize: '0.875rem' }}
                >
                  选择
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".tif,.tiff,.png"
                    onChange={handleFileInput}
                  />
                </Button>
              ),
            }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
            {selectedFiles.map((file, index) => (
              <Box key={index} sx={{ position: 'relative', margin: 1 }}>
                <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                <IconButton
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  onClick={() => handleRemoveFile(index)}
                >
                  <CloseIcon style={{ color: 'red' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRun}
            disabled={isProcessing}
            sx={{ padding: '8px 20px', fontSize: '0.875rem' }}
          >
            {isProcessing ? 'Processing...' : 'Run'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/visualizationCom')}
            disabled={!isDataReady}  // Disable button if data is not ready
            sx={{ padding: '8px 20px', fontSize: '0.875rem' }}
          >
            Data
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FileUploadAndPreview;









