 const client = filestack.init('ACKCh5lRvQHSz37JsBl6Az');
        document.getElementById('upload-btn').addEventListener('click', () => {
            client.picker({
                fromSources: ['local_file_system', 'url', 'imagesearch', 'facebook', 'instagram', 'googledrive', 'dropbox'],
                accept: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint'],
                transformations: {
                    crop: true,
                    rotate: true,
                    force: true
                },
                onUploadDone: (result) => {
                    console.log('Archivos subidos:', result.filesUploaded);
                    alert('Archivo subido con éxito: ' + result.filesUploaded[0].url);
                    
                    // Opción para convertir el archivo
                    const convertOptions = {
                        from: result.filesUploaded[0].mimetype,
                        to: 'pdf',
                        store: {
                            location: 's3'
                        }
                    };
                    
                    client.convert(result.filesUploaded[0].handle, convertOptions)
                        .then(res => console.log('Archivo convertido:', res))
                        .catch(err => console.error('Error al convertir:', err));
                }
            }).open();
        });

        // Función para ir al inicio de la página (header)
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }