document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const textInput = document.getElementById('text-input');
    const fontSizeInput = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    const fontWeightSelect = document.getElementById('font-weight');
    const bgAccentColors = document.getElementById('bg-accent-colors');
    const textAccentColors = document.getElementById('text-accent-colors');
    const footerAccentColors = document.getElementById('footer-accent-colors');
    const imageSizeSelect = document.getElementById('image-size');
    const logoUpload = document.getElementById('logo-upload');
    const logoSizeInput = document.getElementById('logo-size');
    const logoSizeValue = document.getElementById('logo-size-value');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    // Preview elements
    const imagePreview = document.getElementById('image-preview');
    const textContent = document.getElementById('text-content');
    const footerBar = document.getElementById('footer-bar');
    const logoPreview = document.getElementById('logo-preview');
    
    // Default values
    let bgColor = '#3498db';
    let textColor = '#ffffff';
    let footerColor = '#2980b9';
    let logoImage = null;
    let currentImageUrl = null; // Store the current image URL for download
    
    // Initialize accent color selectors
    initAccentColors(bgAccentColors, 'bg', '#3498db');
    initAccentColors(textAccentColors, 'text', '#ffffff');
    initAccentColors(footerAccentColors, 'footer', '#2980b9');
    
    // Event listeners
    textInput.addEventListener('input', updatePreview);
    fontSizeInput.addEventListener('input', updateFontSize);
    fontWeightSelect.addEventListener('change', updatePreview);
    imageSizeSelect.addEventListener('change', updateImageSize);
    logoUpload.addEventListener('change', handleLogoUpload);
    logoSizeInput.addEventListener('input', updateLogoSize);
    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', function() {
        if (currentImageUrl) {
            downloadImage(currentImageUrl);
        }
    });
    
    // Initialize preview
    updatePreview();
    
    // Functions
    function initAccentColors(container, type, defaultColor) {
        const colors = container.querySelectorAll('.accent-color');
        
        colors.forEach(color => {
            const colorValue = color.getAttribute('data-color');
            
            if (colorValue === defaultColor) {
                color.classList.add('selected');
            }
            
            color.addEventListener('click', () => {
                // Remove selected class from all colors in this container
                colors.forEach(c => c.classList.remove('selected'));
                
                // Add selected class to clicked color
                color.classList.add('selected');
                
                // Update color variable based on type
                if (type === 'bg') {
                    bgColor = colorValue;
                    imagePreview.style.backgroundColor = bgColor;
                } else if (type === 'text') {
                    textColor = colorValue;
                    textContent.style.color = textColor;
                } else if (type === 'footer') {
                    footerColor = colorValue;
                    footerBar.style.backgroundColor = footerColor;
                }
            });
        });
    }
    
    function updatePreview() {
        textContent.textContent = textInput.value || 'ಇಲ್ಲಿ ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯ ಕಾಣಿಸುತ್ತದೆ';
        textContent.style.fontWeight = fontWeightSelect.value;
    }
    
    function updateFontSize() {
        const size = fontSizeInput.value;
        fontSizeValue.textContent = `${size}px`;
        textContent.style.fontSize = `${size}px`;
    }
    
    function updateLogoSize() {
        const size = logoSizeInput.value;
        logoSizeValue.textContent = `${size}px`;
        logoPreview.style.height = `${size}px`;
    }
    
    function updateImageSize() {
        const size = imageSizeSelect.value;
        let aspectRatio;
        
        switch (size) {
            case 'square':
                aspectRatio = '100%'; // 1:1
                break;
            case 'portrait':
                aspectRatio = '125%'; // 4:5
                break;
            case 'landscape':
                aspectRatio = '56.3%'; // 16:9
                break;
            case 'twitter':
                aspectRatio = '50%'; // 2:1
                break;
            default:
                aspectRatio = '100%';
        }
        
        imagePreview.style.paddingBottom = aspectRatio;
    }
    
    function handleLogoUpload(e) {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                logoImage = event.target.result;
                logoPreview.src = logoImage;
                logoPreview.style.display = 'block';
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    function generateImage() {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions based on selected size
        let width, height;
        
        switch (imageSizeSelect.value) {
            case 'square':
                width = 1080;
                height = 1080;
                break;
            case 'portrait':
                width = 1080;
                height = 1350;
                break;
            case 'landscape':
                width = 1080;
                height = 608;
                break;
            case 'twitter':
                width = 1200;
                height = 600;
                break;
            default:
                width = 1080;
                height = 1080;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        
        // Draw footer bar
        const footerHeight = Math.round(height * 0.06); // 6% of image height
        ctx.fillStyle = footerColor;
        ctx.fillRect(0, height - footerHeight, width, footerHeight);
        
        // Draw text
        const text = textInput.value || 'ಇಲ್ಲಿ ನಿಮ್ಮ ಕನ್ನಡ ಪಠ್ಯ ಕಾಣಿಸುತ್ತದೆ';
        const fontSize = parseInt(fontSizeInput.value, 10);
        const fontWeight = fontWeightSelect.value;
        
        ctx.fillStyle = textColor;
        ctx.font = `${fontWeight} ${fontSize}px 'Baloo Tamma 2'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Handle text wrapping
        const maxWidth = width * 0.8; // 80% of image width
        const lineHeight = fontSize * 1.2;
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        
        lines.push(currentLine);
        
        // Calculate vertical position for text
        const textAreaHeight = height - footerHeight;
        const textY = textAreaHeight / 2 - (lines.length - 1) * lineHeight / 2;
        
        // Draw each line of text
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, textY + index * lineHeight);
        });
        
        // Function to finalize the image after logo is drawn (or if no logo)
        function finalizeImage() {
            // Convert canvas to image
            currentImageUrl = canvas.toDataURL('image/png');
            
            // Create a container for the generated image
            const previewContainer = document.createElement('div');
            previewContainer.style.width = '100%';
            previewContainer.style.position = 'relative';
            previewContainer.style.borderRadius = 'var(--border-radius)';
            previewContainer.style.overflow = 'hidden';
            previewContainer.style.boxShadow = 'var(--shadow-lg)';
            
            // Display generated image
            const generatedImg = new Image();
            generatedImg.src = currentImageUrl;
            generatedImg.style.width = '100%';
            generatedImg.style.height = 'auto';
            generatedImg.style.display = 'block';
            
            previewContainer.appendChild(generatedImg);
            
            // Clear preview and append generated image
            while (imagePreview.firstChild) {
                imagePreview.removeChild(imagePreview.firstChild);
            }
            
            // Reset the padding-bottom since we now have an actual image
            imagePreview.style.height = 'auto';
            imagePreview.style.paddingBottom = '0';
            
            imagePreview.appendChild(previewContainer);
            
            // Enable download button
            downloadBtn.disabled = false;
        }
        
        // Draw logo if available
        if (logoImage) {
            const logoImg = new Image();
            
            logoImg.onload = function() {
                const logoSize = parseInt(logoSizeInput.value, 10);
                
                // Limit logo height to 80% of footer height to prevent overflow
                const maxLogoHeight = footerHeight * 0.8;
                let logoHeight = logoSize;
                
                // Scale down logo if it's too large
                if (logoHeight > maxLogoHeight) {
                    logoHeight = maxLogoHeight;
                }
                
                const logoRatio = logoImg.width / logoImg.height;
                const logoWidth = logoHeight * logoRatio;
                
                // Center logo in footer bar
                const logoX = (width - logoWidth) / 2;
                const logoY = height - footerHeight + (footerHeight - logoHeight) / 2;
                
                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                
                finalizeImage();
            };
            
            logoImg.src = logoImage;
        } else {
            finalizeImage();
        }
    }
    
    function downloadImage(imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'kannada-text-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
