        // Initialize feather icons
        feather.replace();
        
        let currentConverter = '';
        let selectedFiles = [];
        let currentPdfTool = '';

        function selectConverter(type) {
            currentConverter = type;
            const interface = document.getElementById('conversion-interface');
            const title = document.getElementById('converter-title');
            const pdfToolsOptions = document.getElementById('pdf-tools-options');
            
            interface.classList.remove('hidden');
            pdfToolsOptions.classList.add('hidden');
            
            const titles = {
                'word-to-pdf': '📄 Word to PDF',
                'pdf-to-word': '📝 PDF to Word',
                'png-to-pdf': '🖼️ PNG to PDF',
                'pdf-to-png': '🎨 PDF to PNG',
                'ppt-to-pdf': '📊 PowerPoint to PDF',
                'pdf-tools': '🔧 PDF Tools'
            };
            
            title.textContent = titles[type];
            
            if (type === 'pdf-tools') {
                pdfToolsOptions.classList.remove('hidden');
            }
            
            resetInterface();
        }

        function selectPdfTool(tool) {
            currentPdfTool = tool;
            const title = document.getElementById('converter-title');
            title.textContent = tool === 'split' ? '✂️ Split PDF' : '🔗 Merge PDFs';
        }

        function closeConverter() {
            document.getElementById('conversion-interface').classList.add('hidden');
            resetInterface();
        }

        function resetInterface() {
            selectedFiles = [];
            document.getElementById('file-list').classList.add('hidden');
            document.getElementById('convert-btn').classList.add('hidden');
            document.getElementById('progress-container').classList.add('hidden');
            document.getElementById('results-container').classList.add('hidden');
            document.getElementById('files-container').innerHTML = '';
        }

        // Drag and drop functionality
        const uploadZone = document.getElementById('upload-zone');
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        function handleFileSelect(event) {
            handleFiles(event.target.files);
        }

        function handleFiles(files) {
            selectedFiles = Array.from(files);
            displayFiles();
        }

        function displayFiles() {
            const fileList = document.getElementById('file-list');
            const filesContainer = document.getElementById('files-container');
            const convertBtn = document.getElementById('convert-btn');
            
            if (selectedFiles.length === 0) {
                fileList.classList.add('hidden');
                convertBtn.classList.add('hidden');
                return;
            }
            
            fileList.classList.remove('hidden');
            convertBtn.classList.remove('hidden');
            
            filesContainer.innerHTML = '';
            
            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item flex items-center justify-between';
                fileItem.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span class="text-sm">${getFileIcon(file.name)}</span>
                        </div>
                        <div>
                            <p class="font-medium">${file.name}</p>
                            <p class="text-sm text-slate-500">${formatFileSize(file.size)}</p>
                        </div>
                    </div>
                    <button onclick="removeFile(${index})" class="text-rose-500 hover:text-rose-600 p-2">
                        <i data-feather="trash-2" class="w-5 h-5"></i>
                    </button>
                `;
                filesContainer.appendChild(fileItem);
                feather.replace();
            });
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            displayFiles();
        }

        function getFileIcon(filename) {
            const ext = filename.split('.').pop().toLowerCase();
            const icons = {
                'pdf': '📄',
                'doc': '📝',
                'docx': '📝',
                'png': '🖼️',
                'jpg': '🖼️',
                'jpeg': '🖼️',
                'ppt': '📊',
                'pptx': '📊'
            };
            return icons[ext] || '📁';
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function startConversion() {
            if (selectedFiles.length === 0) return;
            
            const progressContainer = document.getElementById('progress-container');
            const resultsContainer = document.getElementById('results-container');
            const convertBtn = document.getElementById('convert-btn');
            
            progressContainer.classList.remove('hidden');
            resultsContainer.classList.add('hidden');
            convertBtn.classList.add('hidden');
            
            simulateConversion();
        }

        function simulateConversion() {
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;
                
                progressBar.style.width = progress + '%';
                progressText.textContent = Math.round(progress) + '%';
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(showResults, 500);
                }
            }, 200);
        }

        function showResults() {
            const progressContainer = document.getElementById('progress-container');
            const resultsContainer = document.getElementById('results-container');
            const downloadLinks = document.getElementById('download-links');
            const convertBtn = document.getElementById('convert-btn');
            
            progressContainer.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
            convertBtn.classList.remove('hidden');
            convertBtn.textContent = '🔄 Convert More Files';
            
            downloadLinks.innerHTML = '';
            
            selectedFiles.forEach((file, index) => {
                const link = document.createElement('div');
                link.className = 'file-item flex items-center justify-between';
                
                const outputName = getOutputFileName(file.name);
                
                link.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                            <span class="text-sm">✅</span>
                        </div>
                        <div>
                            <p class="font-medium">${outputName}</p>
                            <p class="text-sm text-emerald-600">Conversion complete</p>
                        </div>
                    </div>
                    <button onclick="downloadFile('${outputName}')" class="btn-primary px-4 py-2 rounded-lg text-white text-sm">
                        <i data-feather="download" class="w-4 h-4 mr-1"></i> Download
                    </button>
                `;
                downloadLinks.appendChild(link);
                feather.replace();
            });
        }

        function getOutputFileName(inputName) {
            const baseName = inputName.split('.')[0];
            const conversions = {
                'word-to-pdf': baseName + '.pdf',
                'pdf-to-word': baseName + '.docx',
                'png-to-pdf': baseName + '.pdf',
                'pdf-to-png': baseName + '.png',
                'ppt-to-pdf': baseName + '.pdf'
            };
            
            if (currentConverter === 'pdf-tools') {
                if (currentPdfTool === 'split') {
                    return baseName + '_page_1.pdf';
                } else {
                    return 'combined_document.pdf';
                }
            }
            
            return conversions[currentConverter] || inputName;
        }

        function downloadFile(filename) {
            alert(`🎉 Descaga Simulada!\n\nCon Implementacion real, este seria el archivo a descargar: ${filename}\n\nNota: Esta es una demostracion de UI. La conversion real requiere implementacion en el backend.`);
        }

        // Close converter when clicking outside
        window.addEventListener('click', (e) => {
            const interface = document.getElementById('conversion-interface');
            if (!interface.contains(e.target) && !e.target.closest('.converter-card')) {
                closeConverter();
            }
        });

        // Implementation 
        //Backend integration would go here
        async function convertFile(file) {
            // Placeholder for actual conversion logic
            // Simulate conversion delay
            // 
            await new Promise((resolve) => { setTimeout(resolve, 2000); });
            return new Promise((resolve) => {
                setTimeout(() => resolve(file), 1000);
            });
        }